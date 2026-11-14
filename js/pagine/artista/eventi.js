// I miei eventi (artista): incarichi in arrivo e passati. Il cachet mostrato è sempre e solo il suo.
import { h } from '../../ui/dom.js';
import { intestazione, card, tabella, badgeStato } from '../../ui/componenti.js';
import { incarichiArtista } from '../../core/aree.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';
import { euro } from '../../core/numeri.js';
import { oggiISO, formatoBreve } from '../../core/date.js';

export const colonneIncarichi = [
  {
    titolo: 'Evento',
    valore: (i) => h('div', { class: 'cella-evento' },
      h('span', { class: 'cella-evento-titolo' }, i.titolo),
      h('span', { class: 'cella-evento-sotto' }, i.location ? i.location.nome : 'Location da definire')),
  },
  { titolo: 'Data', valore: (i) => (i.data ? formatoBreve(i.data) : 'Da definire') },
  { titolo: 'Momento', valore: (i) => i.momento },
  { titolo: 'Incarico', valore: (i) => badgeStato(i.statoIncarico) },
  { titolo: 'Il tuo cachet', valore: (i) => euro(i.cachet), allinea: 'destra' },
];

export function render(ctx) {
  const oggi = oggiISO(new Date());
  const tutti = incarichiArtista(ctx.dati, ID_ARTISTA_DEMO);
  const inArrivo = tutti.filter((i) => !i.data || i.data >= oggi);
  const passati = tutti.filter((i) => i.data && i.data < oggi).reverse();
  const suRiga = (i) => ctx.vai(`#/artista/eventi/${encodeURIComponent(i.eventoId)}`);
  return h('div', { class: 'pagina-anagrafica' },
    intestazione({ titolo: 'I miei eventi', sottotitolo: 'Gli eventi in cui sei nel cast.' }),
    card({ titolo: 'In arrivo', conteggio: inArrivo.length, piatto: true },
      tabella(colonneIncarichi, inArrivo, { vuoto: 'Non hai eventi in arrivo.', etichetta: 'Eventi in arrivo', suRiga })),
    card({ titolo: 'Passati', conteggio: passati.length, piatto: true },
      tabella(colonneIncarichi, passati, { vuoto: 'Nessun evento passato.', etichetta: 'Eventi passati', suRiga })));
}
