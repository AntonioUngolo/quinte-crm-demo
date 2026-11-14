// Calendario del titolare: mese, filtro per artista, elenco del giorno.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, campo, statoVuoto } from '../../ui/componenti.js';
import { calendarioMese, legendaCalendario, vociDelGiorno, testoVoce } from '../../ui/calendario-mese.js';
import { vociCalendario } from '../../core/calendario.js';
import { registraReset } from '../../ui/reset.js';
import { oggiISO, aggiungiMesi, nomeMese, formatoLungo } from '../../core/date.js';

const FORMATO_MESE = /^(\d{4})-(0[1-9]|1[0-2])$/;

function hashMese(meseISO, artistaId) {
  return `#/calendario?mese=${meseISO}${artistaId ? `&artista=${encodeURIComponent(artistaId)}` : ''}`;
}

/** Giorno da mostrare sotto la griglia: oggi se nel mese, altrimenti il primo con voci, altrimenti il 1. */
function giornoIniziale(meseISO, voci, oggi) {
  if (oggi.startsWith(meseISO)) return oggi;
  const primo = voci.map((v) => v.data).filter((d) => d.startsWith(meseISO)).sort()[0];
  return primo || `${meseISO}-01`;
}

// Giorno scelto ricordato nella sessione di pagina (per mese), così sopravvive ai ridisegni.
const scelta = { mese: '', giorno: '' };
registraReset(() => { scelta.mese = ''; scelta.giorno = ''; });

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
  const artista = dati.artisti.find((a) => a.id === params.artista) || null;
  const artistaId = artista ? artista.id : null;
  const voci = vociCalendario(dati, { artistaId });

  if (voci.some((v) => v.tipo === 'evento' && v.daUtente && v.data.startsWith(meseISO))) {
    ctx.segnaPasso('calendario');
  }

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
      onClick: () => ctx.vai(hashMese(aggiungiMesi(`${meseISO}-01`, -1).slice(0, 7), artistaId)),
    }, icona('caret-left')),
    h('h2', { class: 'cal-mese', 'aria-live': 'polite' }, `${nomeMese(mese - 1)} ${anno}`),
    h('button', {
      type: 'button', class: 'btn btn-secondario btn-sm cal-freccia', 'aria-label': 'Mese successivo',
      onClick: () => ctx.vai(hashMese(aggiungiMesi(`${meseISO}-01`, 1).slice(0, 7), artistaId)),
    }, icona('caret-right')),
    h('button', {
      type: 'button', class: 'btn btn-secondario btn-sm',
      onClick: () => ctx.vai(hashMese(oggi.slice(0, 7), artistaId)),
    }, 'Oggi'));

  const filtro = campo({
    etichetta: 'Mostra gli eventi di', nome: 'artista', tipo: 'select', valore: artistaId || '',
    vuota: 'Tutti gli eventi',
    opzioni: [...dati.artisti].sort((a, b) => a.nome.localeCompare(b.nome))
      .map((a) => ({ valore: a.id, etichetta: a.nome })),
  });
  filtro.classList.add('cal-filtro');
  filtro.querySelector('select').addEventListener('change', (e) => {
    ctx.vai(hashMese(meseISO, e.target.value || null));
  });

  return h('div', { class: 'pagina-calendario' },
    intestazione({ titolo: 'Calendario', sottotitolo: 'Eventi, appuntamenti e impegni del mese.' }),
    h('div', { class: 'cal-barra' }, navigazione, filtro),
    card(null,
      zonaGriglia,
      legendaCalendario(artistaId ? ['evento'] : undefined),
      artistaId ? h('p', { class: 'cal-nota' }, `Stai vedendo solo gli eventi in cui lavora ${artista.nome}.`) : null),
    card('Giorno scelto', zonaGiorno));
}
