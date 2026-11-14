// Home del cliente: i suoi eventi, con i giorni che mancano. Nessun importo e nessun cachet.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, badgeStato, statoVuoto } from '../../ui/componenti.js';
import { eventiCliente } from '../../core/aree.js';
import { ID_CLIENTE_DEMO } from '../../core/seed.js';
import { oggiISO, formatoLungo, giorniTra } from '../../core/date.js';
import { giorniMancanti } from '../area-comune.js';
import { persona } from '../../ui/guscio.js';

export function render(ctx) {
  const oggi = oggiISO(new Date());
  const lista = eventiCliente(ctx.dati, ID_CLIENTE_DEMO);
  const prossimo = lista.find((e) => e.data && e.data >= oggi);
  const apri = (e) => `#/cliente/eventi/${encodeURIComponent(e.eventoId)}`;

  const conto = prossimo ? giorniTra(oggi, prossimo.data) : null;
  const contoTesto = conto === null ? '' : conto === 0 ? 'Oggi' : conto === 1 ? '1 giorno' : `${conto} giorni`;

  return h('div', { class: 'pagina-dashboard' },
    intestazione({ sopratitolo: 'Benvenuti,', titolo: persona(ctx.dati).nome, sottotitolo: 'Qui trovate tutto sul vostro evento.' }),
    prossimo ? card(null, h('div', { class: 'conto-giorni' },
      h('div', { class: 'conto-giorni-numero' },
        h('strong', {}, contoTesto), h('span', {}, conto === 0 ? 'è il giorno del vostro evento' : 'al vostro evento')),
      h('div', { class: 'conto-giorni-testi' },
        h('span', { class: 'voce-elenco-titolo' }, prossimo.titolo),
        h('span', { class: 'voce-elenco-sotto' }, [formatoLungo(prossimo.data), prossimo.location ? prossimo.location.nome : null].filter(Boolean).join(' · ')),
        h('a', { class: 'btn btn-primario', href: apri(prossimo) }, h('span', {}, 'Apri l’evento'), icona('arrow-right'))))) : null,
    card({ titolo: 'I vostri eventi', conteggio: lista.length },
      lista.length
        ? h('ul', { class: 'elenco-voci' }, lista.map((e) => h('li', { class: 'voce-elenco voce-incarico' },
          h('a', { class: 'voce-elenco-testi voce-incarico-testi', href: apri(e) },
            h('span', { class: 'voce-elenco-titolo' }, e.titolo),
            h('span', { class: 'voce-elenco-sotto' },
              [e.data ? formatoLungo(e.data) : 'Data da definire', e.location ? e.location.nome : null].filter(Boolean).join(' · ')),
            h('span', { class: 'voce-elenco-sotto' }, giorniMancanti(e.data))),
          badgeStato(e.stato))))
        : statoVuoto('Non ci sono ancora eventi collegati a voi.', 'calendar-blank')));
}
