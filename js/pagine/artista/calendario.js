// Calendario dell'artista: i suoi eventi e le date bloccate.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, statoVuoto, bottoneSolaLettura } from '../../ui/componenti.js';
import { calendarioMese, legendaCalendario, vociDelGiorno, testoVoce } from '../../ui/calendario-mese.js';
import { vociCalendarioArtista } from '../../core/aree.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';
import { registraReset } from '../../ui/reset.js';
import { oggiISO, aggiungiMesi, nomeMese, formatoLungo, formatoBreve } from '../../core/date.js';

const FORMATO_MESE = /^(\d{4})-(0[1-9]|1[0-2])$/;
const hashMese = (m) => `#/artista/calendario?mese=${m}`;
const scelta = { mese: '', giorno: '' };
registraReset(() => { scelta.mese = ''; scelta.giorno = ''; });

function giornoIniziale(meseISO, voci, oggi) {
  if (oggi.startsWith(meseISO)) return oggi;
  return voci.map((v) => v.data).filter((d) => d.startsWith(meseISO)).sort()[0] || `${meseISO}-01`;
}

function elencoGiorno(giorno, voci) {
  const del = vociDelGiorno(voci, giorno);
  return h('div', { class: 'cal-giorno-elenco', 'aria-live': 'polite' },
    h('h2', { class: 'cal-giorno-titolo' }, formatoLungo(giorno)),
    del.length
      ? h('ul', { class: 'cal-lista' }, del.map((v) => h('li', {},
        v.hash
          ? h('a', { class: `cal-riga cal-riga--${v.tipo}`, href: v.hash },
            h('span', { class: `cal-punto cal-punto--${v.tipo}`, 'aria-hidden': 'true' }),
            h('span', { class: 'cal-riga-testo' }, testoVoce(v)), icona('caret-right'))
          : h('div', { class: `cal-riga cal-riga--${v.tipo}` },
            h('span', { class: `cal-punto cal-punto--${v.tipo}`, 'aria-hidden': 'true' }),
            h('span', { class: 'cal-riga-testo' }, testoVoce(v))))))
      : statoVuoto('Niente in programma in questo giorno.', 'calendar-blank'));
}

export function render(ctx) {
  const { dati, params } = ctx;
  const oggi = oggiISO(new Date());
  const meseISO = FORMATO_MESE.test(params.mese || '') ? params.mese : oggi.slice(0, 7);
  const [anno, mese] = meseISO.split('-').map(Number);
  const voci = vociCalendarioArtista(dati, ID_ARTISTA_DEMO);
  const artista = dati.artisti.find((a) => a.id === ID_ARTISTA_DEMO);
  const bloccate = [...((artista && artista.dateBloccate) || [])].sort();

  if (scelta.mese !== meseISO) { scelta.mese = meseISO; scelta.giorno = giornoIniziale(meseISO, voci, oggi); }

  const zonaGriglia = h('div');
  const zonaGiorno = h('div');
  function disegnaGriglia() {
    zonaGriglia.replaceChildren(calendarioMese({
      anno, mese, voci, giornoScelto: scelta.giorno,
      suGiorno: (iso) => {
        scelta.giorno = iso;
        disegnaGriglia();
        const bottone = zonaGriglia.querySelector(`[data-fuoco="giorno-${iso}"]`);
        if (bottone) bottone.focus({ preventScroll: true });
      },
    }));
    zonaGiorno.replaceChildren(elencoGiorno(scelta.giorno, voci));
  }
  disegnaGriglia();

  const navigazione = h('div', { class: 'cal-nav' },
    h('button', {
      type: 'button', class: 'btn btn-secondario btn-sm cal-freccia', 'aria-label': 'Mese precedente',
      onClick: () => ctx.vai(hashMese(aggiungiMesi(`${meseISO}-01`, -1).slice(0, 7))),
    }, icona('caret-left')),
    h('h2', { class: 'cal-mese', 'aria-live': 'polite' }, `${nomeMese(mese - 1)} ${anno}`),
    h('button', {
      type: 'button', class: 'btn btn-secondario btn-sm cal-freccia', 'aria-label': 'Mese successivo',
      onClick: () => ctx.vai(hashMese(aggiungiMesi(`${meseISO}-01`, 1).slice(0, 7))),
    }, icona('caret-right')),
    h('button', { type: 'button', class: 'btn btn-secondario btn-sm', onClick: () => ctx.vai(hashMese(oggi.slice(0, 7))) }, 'Oggi'));

  return h('div', { class: 'pagina-calendario' },
    intestazione({ titolo: 'Calendario', sottotitolo: 'I tuoi eventi e le date in cui non sei disponibile.' }),
    h('div', { class: 'cal-barra' }, navigazione),
    card(null, zonaGriglia, legendaCalendario(['evento', 'assenza'])),
    card('Giorno scelto', zonaGiorno),
    card({
      titolo: 'Date bloccate', conteggio: bloccate.length,
      azioni: [bottoneSolaLettura('Blocca una data', ctx, { variante: 'secondario', icona: 'calendar-x' })],
    },
    bloccate.length
      ? h('ul', { class: 'etichette-lista' }, bloccate.map((d) => h('li', { class: 'etichetta-lista' }, formatoBreve(d))))
      : h('p', { class: 'testo-vuoto' }, 'Nessuna data bloccata: risulti disponibile tutti i giorni.')));
}
