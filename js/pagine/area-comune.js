// Pezzi condivisi dalle aree di Artista e Cliente.
import { h } from '../ui/dom.js';
import { intestazione, card, statoVuoto } from '../ui/componenti.js';
import { giorniTra, oggiISO } from '../core/date.js';

/** Riga etichetta/valore di una lista dati. */
export function riga(etichetta, valore) {
  return h('div', { class: 'dato' },
    h('dt', { class: 'dato-etichetta' }, etichetta),
    h('dd', { class: 'dato-valore' }, valore === null || valore === undefined || valore === '' ? 'Non indicato' : valore));
}

export function giorniMancanti(data) {
  if (!data) return 'Data da definire';
  const n = giorniTra(oggiISO(new Date()), data);
  if (n === 0) return 'Oggi';
  if (n === 1) return 'Domani';
  if (n > 1) return `Tra ${n} giorni`;
  return n === -1 ? 'Ieri' : `${-n} giorni fa`;
}

/** Pagina «non trovato» con la strada per tornare indietro. */
export function nonTrovato(ctx, { titolo, testo, hash, etichetta, icona = 'calendar-x' }) {
  return h('div', {},
    intestazione({ titolo }),
    card(null, statoVuoto(testo, icona),
      h('div', { class: 'azioni-centro' },
        h('button', { type: 'button', class: 'btn btn-primario', onClick: () => ctx.vai(hash) }, etichetta))));
}

/** Indirizzo su una riga. */
export function indirizzo(l) {
  return l ? [l.indirizzo, l.citta].filter(Boolean).join(', ') : '';
}
