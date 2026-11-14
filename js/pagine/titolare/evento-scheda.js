// Scheda evento: testata, sei sezioni (come l'app vera) e link alla chat.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, badgeStato, bottoneSolaLettura, statoVuoto } from '../../ui/componenti.js';
import { trovaEvento, eliminaEvento } from '../../core/azioni.js';
import { speseEvento, utileEvento, incassato, saldo, senzaTotale } from '../../core/calcoli.js';
import { euro } from '../../core/numeri.js';
import { formatoLungo, formatoBreve, giorniTra, oggiISO } from '../../core/date.js';
import { nomeLocation, nomeCliente } from './eventi.js';
import { disegnaCast } from './evento-cast.js';

export const SEZIONI = [
  { id: 'panoramica', etichetta: 'Panoramica' },
  { id: 'cast', etichetta: 'Cast artistico' },
  { id: 'pagamenti', etichetta: 'Pagamenti' },
  { id: 'musica', etichetta: 'Musica' },
  { id: 'allestimento', etichetta: 'Allestimento e service' },
  { id: 'contratti', etichetta: 'Contratti' },
];

// Quando l'utente cambia sezione, il focus torna al controllo dopo il ridisegno.
let fuocoDaRidare = null;

const hashSezione = (id, sezione) => `#/eventi/${encodeURIComponent(id)}?sezione=${sezione}`;

function riga(etichetta, valore) {
  return h('div', { class: 'dato' },
    h('dt', { class: 'dato-etichetta' }, etichetta),
    h('dd', { class: 'dato-valore' }, valore === null || valore === undefined || valore === '' ? 'Non indicato' : valore));
}

function giorniMancanti(data) {
  if (!data) return 'Data da definire';
  const n = giorniTra(oggiISO(new Date()), data);
  if (n === 0) return 'Oggi';
  if (n === 1) return 'Domani';
  if (n > 1) return `Tra ${n} giorni`;
  return n === -1 ? 'Ieri' : `${-n} giorni fa`;
}

function panoramica(ctx, e) {
  const { dati } = ctx;
  const location = dati.location.find((l) => l.id === e.locationId);
  const chiesa = dati.chiese.find((c) => c.id === e.chiesaId);
  const cerimonia = e.tipo === 'Matrimonio' || e.tipo === 'Cerimonia';
  return h('div', { class: 'scheda-sezione' },
    h('div', { class: 'griglia-due' },
      card('Dati dell’evento',
        h('dl', { class: 'dati' },
          riga('Tipo', e.tipo),
          riga('Stato', badgeStato(e.stato)),
          riga('Data', e.data ? formatoLungo(e.data) : ''),
          riga('Giorni mancanti', giorniMancanti(e.data)),
          riga('Fascia', e.fascia),
          riga('Invitati', e.invitati ? String(e.invitati) : ''),
          riga('Referente', e.referente),
          riga('Provenienza', e.provenienza),
          riga('SIAE', e.siae ? 'Sì' : 'No'))),
      card('Luogo e cliente',
        h('dl', { class: 'dati' },
          riga('Location', location ? location.nome : ''),
          riga('Indirizzo', location ? [location.indirizzo, location.citta].filter(Boolean).join(', ') : ''),
          riga('Cliente', nomeCliente(dati, e.clienteId)),
          cerimonia ? riga('Rito', e.rito) : null,
          cerimonia && e.rito === 'Religioso' ? riga('Chiesa', chiesa ? `${chiesa.nome}, ${chiesa.citta}` : '') : null),
        location ? h('div', { class: 'dato-azione' }, bottoneSolaLettura('Apri in Maps', ctx, { variante: 'link', icona: 'map-pin' })) : null)),
    card('Note',
      e.note ? h('p', { class: 'nota-testo' }, e.note) : h('p', { class: 'testo-vuoto' }, 'Nessuna nota per questo evento.')),
    e.storicoDate && e.storicoDate.length
      ? card('Storico date',
        h('ul', { class: 'elenco-voci' }, e.storicoDate.map((s) => h('li', { class: 'voce-elenco' },
          h('div', { class: 'voce-elenco-testi' },
            h('span', { class: 'voce-elenco-titolo' }, formatoBreve(s.data)),
            h('span', { class: 'voce-elenco-sotto' }, s.motivo)))))) : null);
}

function pagamenti(ctx, e) {
  const { dati } = ctx;
  const spese = speseEvento(dati, e.id);
  const totaleSpese = spese.reduce((s, x) => s + x.importo, 0);
  const utile = utileEvento(dati, e);
  const incas = incassato(e);
  const sal = saldo(e);

  const voce = (etichetta, valore, nota, classe) => h('div', { class: 'riepilogo-voce' },
    h('span', { class: 'riepilogo-etichetta' }, etichetta),
    h('strong', { class: ['riepilogo-valore', classe] }, valore),
    nota ? h('span', { class: 'riepilogo-nota' }, nota) : null);

  return h('div', { class: 'scheda-sezione' },
    card(null, h('div', { class: 'riepilogo-cast riepilogo-cast--tre' },
      voce('Totale evento', euro(e.totale || 0)),
      voce('Incassato', euro(incas), `${(e.acconti || []).length} ${(e.acconti || []).length === 1 ? 'acconto' : 'acconti'}`),
      voce('Saldo da incassare', euro(sal)))),
    h('div', { class: 'griglia-due' },
      card({ titolo: 'Acconti', conteggio: (e.acconti || []).length },
        (e.acconti || []).length
          ? h('ul', { class: 'elenco-voci' }, e.acconti.map((a) => h('li', { class: 'voce-elenco' },
            h('div', { class: 'voce-elenco-testi' },
              h('span', { class: 'voce-elenco-titolo' }, euro(a.importo)),
              h('span', { class: 'voce-elenco-sotto' }, formatoBreve(a.data))))))
          : statoVuoto('Nessun acconto registrato.', 'coins')),
      card({ titolo: 'Spese dell’evento', conteggio: spese.length },
        spese.length
          ? h('ul', { class: 'elenco-voci' }, spese.map((s) => h('li', { class: 'voce-elenco' },
            h('div', { class: 'voce-elenco-testi' },
              h('span', { class: 'voce-elenco-titolo' }, s.voce),
              h('span', { class: 'voce-elenco-sotto' }, `${s.categoria} · ${formatoBreve(s.data)}`)),
            h('span', { class: 'voce-elenco-data' }, euro(s.importo)))))
          : statoVuoto('Nessuna spesa collegata a questo evento.', 'receipt'),
        spese.length ? h('p', { class: 'riepilogo-nota riga-totale' }, `Totale spese ${euro(totaleSpese)}`) : null)),
    card(null, h('div', { class: 'riepilogo-cast' },
      senzaTotale(e)
        ? h('div', { class: 'riepilogo-voce' },
          h('span', { class: 'riepilogo-etichetta' }, 'Utile stimato'),
          h('span', { class: 'riepilogo-nota' }, 'Inserisci il totale dell’evento per vedere il margine. ',
            h('a', { class: 'link-testo', href: `#/eventi/${encodeURIComponent(e.id)}/modifica` }, 'Modifica l’evento')))
        : voce('Utile stimato', euro(utile), 'Totale dell’evento meno tutte le spese, cachet compresi. In Finanze lo trovi nel Margine per evento, e la dashboard somma quelli dei prossimi 12 mesi.', utile < 0 ? 'riepilogo-valore--negativo' : null)),
    h('p', { class: 'nota-confronto' },
      'Il margine del Cast artistico toglie solo i cachet, l’utile toglie tutte le spese: per questo i due numeri possono essere diversi.'),
    h('div', { class: 'dato-azione' },
      h('button', { type: 'button', class: 'btn btn-link', onClick: () => ctx.vai('#/finanze') }, 'Vai a Finanze e spese', icona('arrow-right')))));
}

function musica(ctx, e) {
  const lista = e.musica || [];
  return h('div', { class: 'scheda-sezione' },
    card({
      titolo: 'Selezione musicale', sottotitolo: 'Brani scelti per ogni momento.',
      azioni: [bottoneSolaLettura('Aggiungi canzone', ctx, { variante: 'primario', icona: 'plus' })],
    },
    lista.length
      ? h('div', { class: 'momenti' }, lista.map((m) => h('div', { class: 'momento' },
        h('h3', { class: 'momento-titolo' }, m.momento),
        h('ol', { class: 'brani' }, (m.brani || []).map((b) => h('li', { class: 'brano' }, b))))))
      : statoVuoto('Nessuna canzone nella selezione musicale di questo evento.', 'music-notes')));
}

function allestimento(ctx, e) {
  const { dati } = ctx;
  const a = e.allestimento || {};
  const service = dati.service.find((s) => s.id === a.serviceId);
  return h('div', { class: 'scheda-sezione' },
    card({
      titolo: 'Service', sottotitolo: 'Chi si occupa di palco, impianto e luci.',
      azioni: [bottoneSolaLettura('Assegna service', ctx, { variante: 'secondario', icona: 'user-plus' })],
    },
    service
      ? h('dl', { class: 'dati' }, riga('Service', service.nome), riga('Referente', service.referente), riga('Telefono', service.telefono))
      : statoVuoto('Nessun service assegnato a questo evento.', 'speaker-high')),
    card({
      titolo: 'Allestimento', sottotitolo: 'Zone e allestimenti richiesti per l’evento.',
      azioni: [bottoneSolaLettura('Aggiungi allestimento', ctx, { variante: 'secondario', icona: 'plus' })],
    },
    a.note ? h('p', { class: 'nota-testo' }, a.note) : statoVuoto('Nessun allestimento inserito.', 'armchair')));
}

function contratti(ctx, e) {
  const lista = e.contratti || [];
  return h('div', { class: 'scheda-sezione' },
    card({
      titolo: 'Contratti', conteggio: lista.length, sottotitolo: 'Documenti dell’evento e loro stato.',
      azioni: [bottoneSolaLettura('Genera contratto', ctx, { variante: 'primario', icona: 'file-plus' })],
    },
    lista.length
      ? h('ul', { class: 'elenco-voci' }, lista.map((c) => h('li', { class: 'voce-elenco' },
        h('div', { class: 'voce-elenco-testi' }, h('span', { class: 'voce-elenco-titolo' }, c.tipo)),
        badgeStato(c.stato))))
      : statoVuoto('Nessun contratto per questo evento.', 'file-text')));
}

function eventoNonTrovato(ctx) {
  return h('div', {},
    intestazione({ titolo: 'Evento non trovato' }),
    card(null, statoVuoto('Questo evento non esiste più. Torna all’elenco per sceglierne un altro.', 'calendar-x'),
      h('div', { class: 'azioni-centro' },
        h('button', { type: 'button', class: 'btn btn-primario', onClick: () => ctx.vai('#/eventi') }, 'Torna agli eventi'))));
}

export function render(ctx) {
  const { dati } = ctx;
  const e = trovaEvento(dati, ctx.params.id);
  if (!e) return eventoNonTrovato(ctx);

  const sezione = SEZIONI.some((s) => s.id === ctx.params.sezione) ? ctx.params.sezione : 'panoramica';
  const vaiA = (id, chiave) => { fuocoDaRidare = chiave; ctx.vai(hashSezione(e.id, id)); };

  async function elimina() {
    const ok = await ctx.conferma(
      `Vuoi eliminare «${e.titolo}»? Spariscono anche le sue spese e non si può annullare.`,
      { titolo: 'Eliminare l’evento?', conferma: 'Elimina', pericolo: true },
    );
    if (!ok) return;
    // Prima si va all'elenco, poi si cancella: così non compare mai «Evento non trovato».
    ctx.vai('#/eventi');
    ctx.aggiorna((d) => { eliminaEvento(d, e.id); });
  }

  const dettagli = [
    e.data ? formatoLungo(e.data) : 'Data da definire',
    nomeLocation(dati, e.locationId) || 'Location da definire',
  ].join(' · ');

  const testata = intestazione({
    titolo: e.titolo || 'Senza titolo',
    sottotitolo: dettagli,
    azioni: [
      h('button', { type: 'button', class: 'btn btn-secondario', onClick: () => ctx.vai(`#/eventi/${encodeURIComponent(e.id)}/modifica`) },
        icona('pencil-simple'), h('span', {}, 'Modifica')),
      bottoneSolaLettura('Duplica', ctx, { variante: 'secondario', icona: 'copy' }),
      bottoneSolaLettura('Sospendi', ctx, { variante: 'secondario', icona: 'pause' }),
      h('button', { type: 'button', class: 'btn btn-secondario btn-pericolo-testo', onClick: elimina },
        icona('trash'), h('span', {}, 'Elimina')),
    ],
  });

  const schede = h('nav', { class: 'schede', 'aria-label': 'Sezioni dell’evento' },
    SEZIONI.map((s) => h('a', {
      class: ['scheda-voce', s.id === sezione ? 'scheda-voce--attiva' : null],
      href: hashSezione(e.id, s.id),
      'aria-current': s.id === sezione ? 'page' : null,
      'data-fuoco': `sez-${s.id}`,
      onClick: (ev) => { ev.preventDefault(); vaiA(s.id, `sez-${s.id}`); },
    }, h('span', {}, s.etichetta))));

  const selettore = h('div', { class: 'schede-select' },
    h('label', { class: 'campo-etichetta', for: 'sezione-evento' }, 'Sezione'),
    h('select', {
      id: 'sezione-evento', class: 'controllo', 'data-fuoco': 'sez-select', value: sezione,
      onChange: (ev) => vaiA(ev.target.value, 'sez-select'),
    }, SEZIONI.map((s) => h('option', { value: s.id }, s.etichetta))));

  const corpi = { panoramica, pagamenti, musica, allestimento, contratti };
  const contenuto = sezione === 'cast' ? disegnaCast(ctx, e) : corpi[sezione](ctx, e);

  const chat = h('a', { class: 'link-chat', href: `#/eventi/${encodeURIComponent(e.id)}/chat` },
    icona('chat-circle-text'), h('span', {}, 'Chat dell’evento'));

  if (fuocoDaRidare) {
    const chiave = fuocoDaRidare;
    fuocoDaRidare = null;
    queueMicrotask(() => document.querySelector(`[data-fuoco="${chiave}"]`)?.focus({ preventScroll: true }));
  }

  return h('div', { class: 'pagina-scheda' },
    testata,
    h('div', { class: 'scheda-meta' }, badgeStato(e.stato), chat),
    schede, selettore,
    h('div', { class: 'scheda-corpo' }, contenuto));
}
