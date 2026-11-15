// Calendario con le viste Giorno · Settimana · Mese, comune a titolare e artista.
// Vista e data stanno nell'indirizzo: #/calendario?vista=giorno&data=2026-11-16 (Mese: ?mese=2026-11).
import { h, icona } from './dom.js';
import { card, statoVuoto } from './componenti.js';
import { calendarioMese, legendaCalendario } from './calendario-mese.js';
import {
  selettoreVista, timeline, giornoDesktop, giornoTelefono, settimanaLista, dettaglioVoce, orarioVoce,
} from './calendario-viste.js';
import { registraReset } from './reset.js';
import { oggiISO, nomeMese, formatoLungo } from '../core/date.js';
import {
  VISTE, eDataISO, giorniSettimana, sposta, dataDaMese, titoloSettimana, listaGiorno,
} from '../core/agenda-viste.js';
import { aggiungiGiorni } from '../core/date.js';

const FORMATO_MESE = /^(\d{4})-(0[1-9]|1[0-2])$/;
const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Sotto i 768 px le forme da telefono (stessa soglia del guscio, che ridisegna quando si passa). */
export function eTelefono() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767.98px)').matches;
}

// Stato della pagina che sopravvive ai ridisegni: giorno scelto nel Mese, voce scelta nel Giorno.
const stati = new Map();
registraReset(() => stati.clear());
function statoDi(base) {
  if (!stati.has(base)) stati.set(base, { mese: '', giorno: '', scelta: null, ultimoIndirizzo: '' });
  return stati.get(base);
}

function giornoIniziale(meseISO, voci, oggi) {
  if (oggi.startsWith(meseISO)) return oggi;
  return voci.map((v) => v.data).filter((d) => d.startsWith(meseISO)).sort()[0] || `${meseISO}-01`;
}

function elencoGiorno(giorno, voci, apri, suApriGiorno) {
  const del = listaGiorno(voci, giorno);
  return h('div', { class: 'cal-giorno-elenco', 'aria-live': 'polite' },
    h('div', { class: 'cal-giorno-elenco-testa' },
      h('h2', { class: 'cal-giorno-titolo' }, formatoLungo(giorno)),
      h('button', { type: 'button', class: 'btn btn-secondario btn-sm', 'data-fuoco': 'apri-giorno', onClick: () => suApriGiorno(giorno) },
        h('span', {}, 'Vedi il giorno'), icona('arrow-right'))),
    del.length
      ? h('ul', { class: 'cal-lista' }, del.map((v) => h('li', {},
        h('button', { type: 'button', class: `cal-riga cal-riga--${v.tipo}`, onClick: () => apri(v) },
          h('span', { class: `cal-punto cal-punto--${v.tipo}`, 'aria-hidden': 'true' }),
          h('span', { class: 'cal-riga-testo' }, `${v.titolo}${v.persona ? ` (${v.persona})` : ''}`),
          h('span', { class: 'cal-riga-ora' }, orarioVoce(v)),
          icona('caret-right')))))
      : statoVuoto('Niente in programma in questo giorno.', 'calendar-blank'));
}

/**
 * Barra (navigazione, selettore, filtro) e card del calendario.
 * @param {object} ctx contesto della pagina
 * @param {{base:string, query?:object, voci:Array, legenda?:string[], nota?:Node|null, filtro?:Node|null,
 *   suVuoto?:(giorno,minuto)=>void|null}} opzioni  `query`: parametri da tenere (es. artista).
 * @returns {{barra:Node, corpo:Node, giorni:string[]}} `giorni`: i giorni visibili (per la guida).
 */
export function calendarioConViste(ctx, { base, query = {}, voci, legenda, nota = null, filtro = null, suVuoto = null }) {
  const { params } = ctx;
  const oggi = oggiISO(new Date());
  const telefono = eTelefono();
  const stato = statoDi(base);
  const vista = VISTE.includes(params.vista) ? params.vista : 'mese';
  const data = eDataISO(params.data) ? params.data : oggi;
  const meseISO = vista === 'mese'
    ? (FORMATO_MESE.test(params.mese || '') ? params.mese : oggi.slice(0, 7))
    : data.slice(0, 7);

  const tenuti = Object.fromEntries(Object.entries(query).filter(([, v]) => v));
  const indirizzo = (q) => `${base}?${new URLSearchParams({ ...q, ...tenuti }).toString()}`;
  const vaiA = (v, d) => ctx.vai(indirizzo({ vista: v, data: d }));
  const vaiMese = (m, giorno = null) => ctx.vai(indirizzo({ vista: 'mese', mese: m, ...(giorno ? { giorno } : {}) }));

  // Giorno scelto nel Mese: dall'indirizzo, altrimenti ricordato per mese; su telefono nessuno.
  if (vista === 'mese') {
    if (eDataISO(params.giorno) && params.giorno.startsWith(meseISO)) { stato.mese = meseISO; stato.giorno = params.giorno; }
    if (stato.mese !== meseISO) { stato.mese = meseISO; stato.giorno = giornoIniziale(meseISO, voci, oggi); }
  }

  const apri = (v) => (v.hash ? ctx.vai(v.hash) : dettaglioVoce(ctx, v));
  const aggiungi = suVuoto;

  // Selettore: dal Mese al giorno scelto (o oggi, o il primo); verso il Mese con il giorno attivo scelto.
  const suVista = (nuova) => {
    if (vista === 'mese') vaiA(nuova, dataDaMese(meseISO, telefono ? null : stato.giorno, oggi));
    else if (nuova === 'mese') vaiMese(data.slice(0, 7), telefono ? null : data);
    else vaiA(nuova, data);
  };

  // Titolo e frecce.
  let titolo;
  if (vista === 'mese') {
    const [a, m] = meseISO.split('-').map(Number);
    titolo = `${nomeMese(m - 1)} ${a}`;
  } else if (vista === 'settimana') titolo = titoloSettimana(data);
  else titolo = telefono ? maiuscola(formatoLungo(data)).replace(/^\S+ /, '') : maiuscola(formatoLungo(data));
  const spostaDi = (verso) => {
    if (vista === 'mese') vaiMese(sposta('mese', `${meseISO}-01`, verso).slice(0, 7));
    else vaiA(vista, sposta(vista, data, verso));
  };
  const etichette = {
    mese: ['Mese precedente', 'Mese successivo'], settimana: ['Settimana precedente', 'Settimana successiva'],
    giorno: ['Giorno precedente', 'Giorno successivo'],
  }[vista];
  const navigazione = h('div', { class: 'cal-nav' },
    h('button', {
      type: 'button', class: 'btn btn-secondario btn-sm cal-freccia', 'aria-label': etichette[0], 'data-fuoco': 'cal-prec',
      onClick: () => spostaDi(-1),
    }, icona('caret-left')),
    h('h2', { class: 'cal-mese', 'aria-live': 'polite' }, titolo),
    h('button', {
      type: 'button', class: 'btn btn-secondario btn-sm cal-freccia', 'aria-label': etichette[1], 'data-fuoco': 'cal-succ',
      onClick: () => spostaDi(1),
    }, icona('caret-right')),
    h('button', {
      type: 'button', class: 'btn btn-secondario btn-sm', 'data-fuoco': 'cal-oggi',
      onClick: () => (vista === 'mese' ? vaiMese(oggi.slice(0, 7), telefono ? null : oggi) : vaiA(vista, oggi)),
    }, 'Oggi'));

  const barra = h('div', { class: 'cal-barra' },
    h('div', { class: 'cal-barra-sinistra' }, selettoreVista(vista, suVista), navigazione),
    filtro);

  // Corpo secondo la vista.
  let corpo;
  let giorni;
  if (vista === 'mese') {
    const [anno, mese] = meseISO.split('-').map(Number);
    const zonaGriglia = h('div');
    const zonaGiorno = h('div');
    const disegnaMese = () => {
      zonaGriglia.replaceChildren(calendarioMese({
        anno, mese, voci, giornoScelto: telefono ? null : stato.giorno, tuttaCella: telefono,
        suGiorno: (iso) => {
          if (telefono) { vaiA('giorno', iso); return; }
          stato.giorno = iso;
          disegnaMese();
          const bottone = zonaGriglia.querySelector(`[data-fuoco="giorno-${iso}"]`);
          if (bottone) bottone.focus({ preventScroll: true });
        },
      }));
      zonaGiorno.replaceChildren(elencoGiorno(stato.giorno, voci, apri, (g) => vaiA('giorno', g)));
    };
    disegnaMese();
    corpo = [
      card({ titolo: null, classe: 'cal-card' }, zonaGriglia, legendaCalendario(legenda), nota),
      telefono ? null : card('Giorno scelto', zonaGiorno),
    ];
    giorni = null;
  } else if (vista === 'settimana') {
    giorni = giorniSettimana(data);
    corpo = card({ titolo: null, classe: 'cal-card' },
      telefono
        ? settimanaLista({ giorno: data, voci, oggi, suVoce: apri, suGiorno: (g) => vaiA('giorno', g) })
        : timeline({ giorni, voci, oggi, suVoce: apri, suVuoto: aggiungi, suGiorno: (g) => vaiA('giorno', g) }),
      legendaCalendario(legenda), nota);
  } else {
    giorni = [data];
    corpo = card({ titolo: null, classe: 'cal-card' },
      telefono
        ? giornoTelefono({
          giorno: data, voci, oggi, suVoce: apri, suVuoto: aggiungi,
          suGiorno: (g, dopo) => vaiA('giorno', g || aggiungiGiorni(data, dopo)),
          suMese: () => vaiMese(data.slice(0, 7)),
        })
        : giornoDesktop({ giorno: data, voci, oggi, suVuoto: aggiungi, suGiorno: (g) => vaiA('giorno', g), apri, stato }),
      legendaCalendario(legenda), nota);
  }

  // Su telefono il Giorno sale in cima allo schermo a ogni cambio d'indirizzo (anche dalla striscia).
  const qui = `${vista}|${data}|${meseISO}`;
  if (telefono && vista === 'giorno' && stato.ultimoIndirizzo !== qui) {
    requestAnimationFrame(() => {
      const el = document.querySelector('.cal-giorno-telefono');
      if (el) el.scrollIntoView({ block: 'start' });
    });
  }
  stato.ultimoIndirizzo = qui;

  if (!giorni) {
    const [anno, mese] = meseISO.split('-').map(Number);
    const ultimo = new Date(Date.UTC(anno, mese, 0)).getUTCDate();
    giorni = Array.from({ length: ultimo }, (_, i) => `${meseISO}-${String(i + 1).padStart(2, '0')}`);
  }
  return { barra, corpo, giorni };
}
