// L'evento visto dal cliente: giorni mancanti, pagamenti, artisti (senza cachet), musica, contratto e privacy.
import { h } from '../../ui/dom.js';
import { intestazione, card, badgeStato, bottoneSolaLettura, statoVuoto } from '../../ui/componenti.js';
import { eventoCliente } from '../../core/aree.js';
import { ID_CLIENTE_DEMO } from '../../core/seed.js';
import { euro } from '../../core/numeri.js';
import { formatoLungo, formatoBreve } from '../../core/date.js';
import { riga, giorniMancanti, nonTrovato, indirizzo } from '../area-comune.js';

export function render(ctx) {
  const e = eventoCliente(ctx.dati, ID_CLIENTE_DEMO, ctx.params.id);
  if (!e) {
    return nonTrovato(ctx, {
      titolo: 'Evento non trovato',
      testo: 'Questo evento non esiste o non è collegato a voi. Tornate all’elenco per vedere i vostri eventi.',
      hash: '#/cliente', etichetta: 'Torna ai miei eventi',
    });
  }
  const p = e.pagamenti;
  const cerimonia = e.tipo === 'Matrimonio' || e.tipo === 'Cerimonia';
  const voce = (etichetta, valore, nota) => h('div', { class: 'riepilogo-voce' },
    h('span', { class: 'riepilogo-etichetta' }, etichetta),
    h('strong', { class: 'riepilogo-valore' }, valore),
    nota ? h('span', { class: 'riepilogo-nota' }, nota) : null);

  return h('div', { class: 'pagina-scheda' },
    h('p', { class: 'indietro' }, h('a', { class: 'link-testo', href: '#/cliente' }, 'Tutti i miei eventi')),
    intestazione({
      titolo: e.titolo,
      sottotitolo: [e.data ? formatoLungo(e.data) : 'Data da definire', e.location ? e.location.nome : null].filter(Boolean).join(' · '),
    }),
    h('div', { class: 'scheda-meta' }, badgeStato(e.stato), h('span', { class: 'voce-elenco-sotto' }, giorniMancanti(e.data))),
    h('div', { class: 'scheda-sezione' },
      h('div', { class: 'griglia-due' },
        card('Il vostro evento', h('dl', { class: 'dati' },
          riga('Data', e.data ? formatoLungo(e.data) : ''),
          riga('Giorni mancanti', giorniMancanti(e.data)),
          riga('Fascia', e.fascia),
          riga('Invitati', e.invitati ? String(e.invitati) : ''),
          riga('Referente', e.referente))),
        card('Dove', h('dl', { class: 'dati' },
          riga('Location', e.location ? e.location.nome : ''),
          riga('Indirizzo', e.location ? indirizzo(e.location) : ''),
          cerimonia ? riga('Rito', e.rito) : null,
          cerimonia && e.rito === 'Religioso' ? riga('Chiesa', e.chiesa ? `${e.chiesa.nome}, ${e.chiesa.citta}` : '') : null),
        e.location ? h('div', { class: 'dato-azione' }, bottoneSolaLettura('Apri in Maps', ctx, { variante: 'link', icona: 'map-pin' })) : null)),
      card('Pagamenti',
        h('div', { class: 'riepilogo-cast riepilogo-cast--tre' },
          voce('Totale', p.totale ? euro(p.totale) : 'Da definire'),
          voce('Acconti versati', euro(p.incassato), `${p.acconti.length} ${p.acconti.length === 1 ? 'acconto' : 'acconti'}`),
          voce('Saldo da versare', p.totale ? euro(p.saldo) : 'Da definire')),
        p.acconti.length
          ? h('ul', { class: 'elenco-voci elenco-sotto' }, p.acconti.map((a) => h('li', { class: 'voce-elenco' },
            h('div', { class: 'voce-elenco-testi' },
              h('span', { class: 'voce-elenco-titolo' }, euro(a.importo)),
              h('span', { class: 'voce-elenco-sotto' }, `Versato il ${formatoBreve(a.data)}`)))))
          : h('p', { class: 'testo-vuoto elenco-sotto' }, 'Nessun acconto versato finora.')),
      card({ titolo: 'Gli artisti', conteggio: e.artisti.length },
        e.artisti.length
          ? h('ul', { class: 'elenco-voci' }, e.artisti.map((a) => h('li', { class: 'voce-elenco' },
            h('div', { class: 'voce-elenco-testi' },
              h('span', { class: 'voce-elenco-titolo' }, a.nome),
              h('span', { class: 'voce-elenco-sotto' }, a.ruolo)),
            h('span', { class: 'voce-elenco-data' }, a.momento))))
          : statoVuoto('Gli artisti non sono ancora stati scelti.', 'microphone-stage')),
      card({
        titolo: 'La vostra musica', sottotitolo: 'Brani scelti per ogni momento.',
        azioni: [bottoneSolaLettura('Scegli i brani', ctx, { variante: 'primario', icona: 'plus' })],
      },
      e.musica.length
        ? h('div', { class: 'momenti' }, e.musica.map((m) => h('div', { class: 'momento' },
          h('h3', { class: 'momento-titolo' }, m.momento),
          h('ol', { class: 'brani' }, m.brani.map((b) => h('li', { class: 'brano' }, b))))))
        : statoVuoto('Non avete ancora scelto nessun brano.', 'music-notes')),
      h('div', { class: 'griglia-due' },
        card({ titolo: 'Contratto', conteggio: e.contratti.length },
          e.contratti.length
            ? h('ul', { class: 'elenco-voci' }, e.contratti.map((c) => h('li', { class: 'voce-elenco' },
              h('div', { class: 'voce-elenco-testi' }, h('span', { class: 'voce-elenco-titolo' }, c.tipo)),
              badgeStato(c.stato))))
            : statoVuoto('Nessun documento per ora.', 'file-text')),
        card('Privacy',
          h('p', { class: 'nota-testo' }, 'Usiamo i vostri dati solo per organizzare l’evento. Potete rileggere l’informativa quando volete.'),
          h('div', { class: 'dato-azione' }, bottoneSolaLettura('Leggi l’informativa', ctx, { variante: 'secondario', icona: 'shield-check' }))))));
}
