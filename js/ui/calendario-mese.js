// Griglia mensile riusabile (titolare e artista). Solo presentazione.
import { h } from './dom.js';
import { grigliaMese } from '../core/calendario.js';
import { formatoLungo, oggiISO } from '../core/date.js';

export const TIPI_VOCE = [
  { tipo: 'evento', etichetta: 'Evento' },
  { tipo: 'appuntamento', etichetta: 'Appuntamento' },
  { tipo: 'interno', etichetta: 'Impegno interno' },
  { tipo: 'assenza', etichetta: 'Assenza' },
];
const SETTIMANA = [['Lun', 'L'], ['Mar', 'M'], ['Mer', 'M'], ['Gio', 'G'], ['Ven', 'V'], ['Sab', 'S'], ['Dom', 'D']];
const MAX_VISIBILI = 3;
const MAX_COMPATTE = 2;

/** Voci che cadono nel giorno `iso` (anche quelle su più giorni). */
export function vociDelGiorno(voci, iso) {
  return voci.filter((v) => v.data <= iso && iso <= (v.dataFine || v.data));
}

/** Legenda dei colori. */
export function legendaCalendario(tipi = TIPI_VOCE.map((t) => t.tipo)) {
  return h('ul', { class: 'cal-legenda', 'aria-label': 'Legenda' },
    TIPI_VOCE.filter((t) => tipi.includes(t.tipo)).map((t) => h('li', { class: 'cal-legenda-voce' },
      h('span', { class: `cal-punto cal-punto--${t.tipo}`, 'aria-hidden': 'true' }), t.etichetta)));
}

/** Etichetta di una voce con l'eventuale ora o persona. */
export function testoVoce(v) {
  const extra = v.ora ? `${v.ora} · ` : '';
  return `${extra}${v.titolo}${v.persona ? ` (${v.persona})` : ''}`;
}

function etichettaGiorno(iso, n) {
  const quante = n === 0 ? 'nessuna voce' : n === 1 ? '1 voce' : `${n} voci`;
  return `${formatoLungo(iso)}, ${quante}`;
}

function vocePillola(v, compatta = false) {
  const classe = `cal-voce cal-voce--${v.tipo}`;
  if (compatta) return h('span', { class: classe, 'aria-hidden': 'true' }, v.titolo);
  if (v.hash) return h('a', { class: classe, href: v.hash, title: v.titolo }, testoVoce(v));
  return h('span', { class: classe, title: testoVoce(v) }, testoVoce(v));
}

/**
 * @param {{anno:number, mese:number, voci:Array, giornoScelto?:string, suGiorno?:(iso:string)=>void, tuttaCella?:boolean}} p
 *  `mese` da 1 a 12; `voci`: [{data, dataFine?, titolo, tipo, hash?}]
 *  `tuttaCella` (telefono): blocchi compatti e il tocco su tutta la cella apre il giorno.
 */
export function calendarioMese({ anno, mese, voci = [], giornoScelto = null, suGiorno = () => {}, tuttaCella = false }) {
  const oggi = oggiISO(new Date());
  const celle = grigliaMese(anno, mese).map(({ iso, delMese }) => {
    const del = vociDelGiorno(voci, iso);
    const numero = Number(iso.slice(8));
    const tipi = [...new Set(del.map((v) => v.tipo))];
    return h('div', {
      class: ['cal-cella', !delMese && 'cal-cella--fuori', iso === oggi && 'cal-cella--oggi',
        iso === giornoScelto && 'cal-cella--scelta', tuttaCella && 'cal-cella--tocco'],
      onClick: tuttaCella ? (e) => { if (!e.target.closest('.cal-num')) suGiorno(iso); } : null,
    },
    h('button', {
      type: 'button', class: 'cal-num', 'data-fuoco': `giorno-${iso}`,
      'aria-label': etichettaGiorno(iso, del.length),
      'aria-pressed': iso === giornoScelto ? 'true' : 'false',
      onClick: () => suGiorno(iso),
    }, String(numero)),
    del.length && tuttaCella ? h('div', { class: 'cal-voci cal-voci--compatte', 'aria-hidden': 'true' },
      del.slice(0, MAX_COMPATTE).map((v) => vocePillola(v, true)),
      del.length > MAX_COMPATTE ? h('span', { class: 'cal-altri' }, `+${del.length - MAX_COMPATTE}`) : null) : null,
    del.length && !tuttaCella ? h('div', { class: 'cal-voci' },
      del.slice(0, MAX_VISIBILI).map((v) => vocePillola(v)),
      del.length > MAX_VISIBILI ? h('button', {
        type: 'button', class: 'cal-altri', onClick: () => suGiorno(iso),
        'aria-label': `Mostra le altre ${del.length - MAX_VISIBILI} voci del ${formatoLungo(iso)}`,
      }, `+${del.length - MAX_VISIBILI} altri`) : null) : null,
    del.length && !tuttaCella ? h('div', { class: 'cal-punti', 'aria-hidden': 'true' },
      tipi.map((t) => h('span', { class: `cal-punto cal-punto--${t}` }))) : null);
  });

  return h('div', { class: 'cal' },
    h('div', { class: 'cal-settimana', 'aria-hidden': 'true' },
      SETTIMANA.map(([lungo, corto]) => h('span', { class: 'cal-giorno-nome' },
        h('span', { class: 'cal-nome-lungo' }, lungo), h('span', { class: 'cal-nome-corto' }, corto)))),
    h('div', { class: 'cal-griglia' }, celle));
}
