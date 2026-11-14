// Elenco eventi (e tabella riusata dalla dashboard).
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, tabella, badgeStato } from '../../ui/componenti.js';
import { registraReset } from '../../ui/reset.js';
import { formatoBreve } from '../../core/date.js';

export const STATI_ARCHIVIO = ['Cancellato', 'Completato', 'Sospeso'];
export const STATI_DA_CONFERMARE = ['Da ricontattare', 'In opzione', 'In trattativa'];

export const nomeLocation = (dati, id) => (dati.location.find((l) => l.id === id) || {}).nome || '';
export const nomeCliente = (dati, id) => (dati.clienti.find((c) => c.id === id) || {}).nome || '';

/** Eventi non archiviati, dal più vicino al più lontano. */
export function eventiAttivi(dati) {
  return dati.eventi
    .filter((e) => !STATI_ARCHIVIO.includes(e.stato))
    .sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999'));
}

/** Tabella eventi con riga cliccabile verso la scheda. */
export function tabellaEventi(ctx, eventi, { vuoto = 'Nessun evento da mostrare.', conPax = true } = {}) {
  const { dati } = ctx;
  const colonne = [
    {
      titolo: 'Evento',
      valore: (e) => h('div', { class: 'cella-evento' },
        h('span', { class: 'cella-evento-titolo' }, e.titolo || 'Senza titolo'),
        h('span', { class: 'cella-evento-sotto' },
          [e.tipo, nomeCliente(dati, e.clienteId)].filter(Boolean).join(' · '))),
    },
    { titolo: 'Data', valore: (e) => (e.data ? formatoBreve(e.data) : 'Da definire') },
    { titolo: 'Location', valore: (e) => nomeLocation(dati, e.locationId) || 'Da definire' },
  ];
  if (conPax) colonne.push({ titolo: 'Pax', valore: (e) => String(e.invitati || 0), allinea: 'destra' });
  colonne.push({ titolo: 'Stato', valore: (e) => badgeStato(e.stato) });
  return tabella(colonne, eventi, {
    vuoto, etichetta: 'Elenco eventi',
    suRiga: (e) => ctx.vai(`#/eventi/${encodeURIComponent(e.id)}`),
  });
}

// Filtri ricordati finché si resta nella demo (non nei dati salvati).
const filtri = { stato: '', cerca: '' };
registraReset(() => { filtri.stato = ''; filtri.cerca = ''; });

export function render(ctx) {
  const { dati } = ctx;
  const attivi = eventiAttivi(dati);
  const stati = ['Da ricontattare', 'In opzione', 'In trattativa', 'Confermato'];
  const zonaElenco = h('div', { 'aria-live': 'polite' });
  const conteggio = h('span', { class: 'conteggio' });
  const zonaChip = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtra per stato' });

  function visibili() {
    const q = filtri.cerca.trim().toLowerCase();
    return attivi.filter((e) => {
      if (filtri.stato && e.stato !== filtri.stato) return false;
      if (!q) return true;
      return [e.titolo, nomeCliente(dati, e.clienteId), nomeLocation(dati, e.locationId)]
        .some((t) => (t || '').toLowerCase().includes(q));
    });
  }

  function disegnaChip() {
    zonaChip.replaceChildren(...[['', 'Tutti'], ...stati.map((s) => [s, s])].map(([valore, etichetta]) => {
      const n = valore ? attivi.filter((e) => e.stato === valore).length : attivi.length;
      return h('button', {
        type: 'button', class: ['chip', filtri.stato === valore ? 'chip--attivo' : null],
        'aria-pressed': filtri.stato === valore ? 'true' : 'false',
        'data-fuoco': `chip-${valore || 'tutti'}`,
        onClick: () => { filtri.stato = valore; disegnaChip(); disegnaElenco(); },
      }, etichetta, h('span', { class: 'chip-n' }, String(n)));
    }));
  }

  function disegnaElenco() {
    const lista = visibili();
    conteggio.textContent = String(lista.length);
    zonaElenco.replaceChildren(tabellaEventi(ctx, lista, {
      vuoto: attivi.length ? 'Nessun evento corrisponde alla ricerca.' : 'Non ci sono ancora eventi. Crea il primo con «Nuovo evento».',
    }));
  }

  const ricerca = h('div', { class: 'ricerca' },
    icona('magnifying-glass'),
    h('input', {
      type: 'search', class: 'controllo', 'aria-label': 'Cerca per titolo, cliente o location',
      placeholder: 'Cerca un evento', value: filtri.cerca, name: 'cerca',
      onInput: (e) => { filtri.cerca = e.target.value; disegnaElenco(); },
    }));

  disegnaChip();
  disegnaElenco();

  return h('div', { class: 'pagina-eventi' },
    intestazione({
      titolo: 'Eventi',
      sottotitolo: 'Tutti gli eventi in corso. Completati, sospesi e cancellati sono nei rispettivi archivi.',
      azioni: [h('button', { type: 'button', class: 'btn btn-primario', onClick: () => ctx.vai('#/eventi/nuovo') },
        icona('plus'), h('span', {}, 'Nuovo evento'))],
    }),
    card({ titolo: h('span', {}, 'Elenco eventi ', conteggio), piatto: true },
      h('div', { class: 'filtri' }, ricerca, zonaChip),
      zonaElenco));
}
