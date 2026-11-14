// Artisti: elenco e scheda in sola lettura.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, tabella, badgeStato, bottoneSolaLettura, statoVuoto } from '../../ui/componenti.js';
import { euro } from '../../core/numeri.js';
import { formatoBreve } from '../../core/date.js';
import { nomeLocation } from './eventi.js';

const vaiArtista = (ctx, a) => ctx.vai(`#/artisti/${encodeURIComponent(a.id)}`);

export function render(ctx) {
  const { dati } = ctx;
  const colonne = [
    {
      titolo: 'Artista',
      valore: (a) => h('div', { class: 'cella-evento' },
        h('span', { class: 'cella-evento-titolo' }, a.nome),
        h('span', { class: 'cella-evento-sotto' }, a.ruolo)),
    },
    { titolo: 'Tipo', valore: (a) => a.tipo },
    { titolo: 'Momenti', valore: (a) => (a.momenti || []).join(', ') || 'Non indicati' },
    { titolo: 'Cachet standard', valore: (a) => euro(a.cachetStandard || 0), allinea: 'destra' },
    { titolo: 'Telefono', valore: (a) => a.telefono || 'Non indicato' },
  ];
  return h('div', { class: 'pagina-anagrafica' },
    intestazione({
      titolo: 'Artisti',
      sottotitolo: 'Il roster dell’agenzia: effettivi e occasionali.',
      azioni: [bottoneSolaLettura('Nuovo artista', ctx, { variante: 'primario', icona: 'plus' })],
    }),
    card({ titolo: 'Roster', conteggio: dati.artisti.length, piatto: true },
      tabella(colonne, dati.artisti, {
        vuoto: 'Nessun artista in elenco.', etichetta: 'Elenco artisti', suRiga: (a) => vaiArtista(ctx, a),
      })));
}

function riga(etichetta, valore) {
  return h('div', { class: 'dato' },
    h('dt', { class: 'dato-etichetta' }, etichetta),
    h('dd', { class: 'dato-valore' }, valore || 'Non indicato'));
}

/** Incarichi di un artista: un elemento per ogni riga del cast in cui compare. */
export function incarichiArtista(dati, artistaId) {
  const righe = [];
  for (const e of dati.eventi) {
    for (const c of e.cast || []) {
      if (c.artistaId === artistaId) righe.push({ evento: e, incarico: c });
    }
  }
  return righe.sort((a, b) => (a.evento.data || '9999').localeCompare(b.evento.data || '9999'));
}

export function renderScheda(ctx) {
  const { dati, params } = ctx;
  const a = dati.artisti.find((x) => x.id === params.id);
  if (!a) {
    return h('div', {}, intestazione({ titolo: 'Artista non trovato' }),
      card(null, statoVuoto('Questo artista non esiste più. Torna all’elenco per sceglierne un altro.', 'user')),
      h('p', {}, h('a', { class: 'link-testo', href: '#/artisti' }, 'Torna agli artisti')));
  }
  const incarichi = incarichiArtista(dati, a.id);
  const colonne = [
    {
      titolo: 'Evento',
      valore: (r) => h('div', { class: 'cella-evento' },
        h('span', { class: 'cella-evento-titolo' }, r.evento.titolo),
        h('span', { class: 'cella-evento-sotto' }, nomeLocation(dati, r.evento.locationId) || 'Location da definire')),
    },
    { titolo: 'Data', valore: (r) => (r.evento.data ? formatoBreve(r.evento.data) : 'Da definire') },
    { titolo: 'Momento', valore: (r) => r.incarico.momento },
    { titolo: 'Incarico', valore: (r) => badgeStato(r.incarico.statoIncarico) },
    { titolo: 'Cachet', valore: (r) => euro(r.incarico.cachet || 0), allinea: 'destra' },
  ];
  const bloccate = [...(a.dateBloccate || [])].sort();
  return h('div', { class: 'pagina-anagrafica' },
    h('p', { class: 'indietro' }, h('a', { class: 'link-testo', href: '#/artisti' }, icona('arrow-left'), ' Tutti gli artisti')),
    intestazione({
      titolo: a.nome,
      sottotitolo: `${a.ruolo} · ${a.tipo}`,
      azioni: [bottoneSolaLettura('Modifica', ctx, { variante: 'secondario', icona: 'pencil-simple' })],
    }),
    h('div', { class: 'scheda-sezione' },
      h('div', { class: 'griglia-due' },
        card('Contatti e ruolo', h('dl', { class: 'dati' },
          riga('Ruolo', a.ruolo),
          riga('Tipo', a.tipo),
          riga('Telefono', a.telefono),
          riga('Email', a.email))),
        card('Momenti e cachet', h('dl', { class: 'dati' },
          riga('Momenti coperti', (a.momenti || []).join(', ')),
          riga('Cachet standard', euro(a.cachetStandard || 0))))),
      card({ titolo: 'Eventi nel cast', conteggio: incarichi.length, piatto: true },
        tabella(colonne, incarichi, {
          vuoto: 'Non è ancora nel cast di nessun evento.', etichetta: 'Eventi dell’artista',
          suRiga: (r) => ctx.vai(`#/eventi/${encodeURIComponent(r.evento.id)}`),
        })),
      card({
        titolo: 'Date bloccate',
        azioni: [bottoneSolaLettura('Blocca una data', ctx, { variante: 'secondario', icona: 'calendar-x' })],
      },
      bloccate.length
        ? h('ul', { class: 'etichette-lista' }, bloccate.map((d) => h('li', { class: 'etichetta-lista' }, formatoBreve(d))))
        : h('p', { class: 'testo-vuoto' }, 'Nessuna data bloccata: è disponibile tutti i giorni.'))));
}
