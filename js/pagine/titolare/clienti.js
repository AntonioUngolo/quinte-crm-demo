// Clienti: elenco e scheda in sola lettura, con gli eventi e gli appuntamenti del cliente.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, tabella, bottoneSolaLettura, statoVuoto } from '../../ui/componenti.js';
import { formatoBreve } from '../../core/date.js';
import { tabellaEventi } from './eventi.js';

const eventiDi = (dati, c) => dati.eventi.filter((e) => e.clienteId === c.id);

export function render(ctx) {
  const { dati } = ctx;
  const colonne = [
    {
      titolo: 'Cliente',
      valore: (c) => h('div', { class: 'cella-evento' },
        h('span', { class: 'cella-evento-titolo' }, c.nome),
        h('span', { class: 'cella-evento-sotto' }, c.email || '')),
    },
    { titolo: 'Provenienza', valore: (c) => c.provenienza || 'Non indicata' },
    { titolo: 'Telefono', valore: (c) => c.telefono || 'Non indicato' },
    { titolo: 'Eventi', valore: (c) => String(eventiDi(dati, c).length), allinea: 'destra' },
  ];
  return h('div', { class: 'pagina-anagrafica' },
    intestazione({
      titolo: 'Clienti',
      sottotitolo: 'Coppie, famiglie e aziende che si sono rivolte all’agenzia.',
      azioni: [bottoneSolaLettura('Nuovo cliente', ctx, { variante: 'primario', icona: 'plus' })],
    }),
    card({ titolo: 'Elenco clienti', conteggio: dati.clienti.length, piatto: true },
      tabella(colonne, dati.clienti, {
        vuoto: 'Nessun cliente in elenco.', etichetta: 'Elenco clienti',
        suRiga: (c) => ctx.vai(`#/clienti/${encodeURIComponent(c.id)}`),
      })));
}

function riga(etichetta, valore) {
  return h('div', { class: 'dato' },
    h('dt', { class: 'dato-etichetta' }, etichetta),
    h('dd', { class: 'dato-valore' }, valore || 'Non indicato'));
}

export function renderScheda(ctx) {
  const { dati, params } = ctx;
  const c = dati.clienti.find((x) => x.id === params.id);
  if (!c) {
    return h('div', {}, intestazione({ titolo: 'Cliente non trovato' }),
      card(null, statoVuoto('Questo cliente non esiste più. Torna all’elenco per sceglierne un altro.', 'user')),
      h('p', {}, h('a', { class: 'link-testo', href: '#/clienti' }, 'Torna ai clienti')));
  }
  const eventi = eventiDi(dati, c).sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999'));
  // Gli appuntamenti portano il nome del cliente come testo.
  const appuntamenti = dati.appuntamenti.filter((p) => p.clienteNome === c.nome)
    .sort((a, b) => `${a.data}${a.ora}`.localeCompare(`${b.data}${b.ora}`));
  const colonneApp = [
    { titolo: 'Appuntamento', valore: (p) => h('span', { class: 'cella-evento-titolo' }, p.titolo) },
    { titolo: 'Quando', valore: (p) => `${formatoBreve(p.data)} alle ${p.ora}` },
    { titolo: 'Tipo', valore: (p) => p.tipo },
    { titolo: 'Con chi', valore: (p) => p.conChi || 'Non indicato' },
  ];
  return h('div', { class: 'pagina-anagrafica' },
    h('p', { class: 'indietro' }, h('a', { class: 'link-testo', href: '#/clienti' }, icona('arrow-left'), ' Tutti i clienti')),
    intestazione({
      titolo: c.nome,
      sottotitolo: c.provenienza ? `Arrivato da: ${c.provenienza}` : undefined,
      azioni: [bottoneSolaLettura('Modifica', ctx, { variante: 'secondario', icona: 'pencil-simple' })],
    }),
    h('div', { class: 'scheda-sezione' },
      card('Contatti', h('dl', { class: 'dati' },
        riga('Telefono', c.telefono),
        riga('Email', c.email),
        riga('Provenienza', c.provenienza))),
      card({ titolo: 'Eventi', conteggio: eventi.length, piatto: true },
        tabellaEventi(ctx, eventi, { vuoto: 'Nessun evento per questo cliente.' })),
      card({ titolo: 'Appuntamenti', conteggio: appuntamenti.length, piatto: true },
        tabella(colonneApp, appuntamenti, { vuoto: 'Nessun appuntamento per questo cliente.', etichetta: 'Appuntamenti del cliente' }))));
}
