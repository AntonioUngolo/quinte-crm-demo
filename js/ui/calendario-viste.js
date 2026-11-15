// Viste Giorno e Settimana del calendario (come nell'app, punto 24.1). Solo presentazione.
import { h, icona } from './dom.js';
import { apriFinestra } from './popup.js';
import { grigliaMese } from '../core/calendario.js';
import { aggiungiMesi, formatoLungo, formatoBreve, nomeMese } from '../core/date.js';
import {
  separaGiorno, listaGiorno, giorniSettimana, minutoIniziale, minutoDaTocco, oraDaMinuti,
  intervallo, vociDelGiorno, MINUTI_GIORNO,
} from '../core/agenda-viste.js';

/** Pixel per minuto della timeline: 48 px l'ora. */
export const PX_MINUTO = 0.8;
const MAX_TUTTO_SETTIMANA = 2;
const NOMI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const INIZIALI = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
const ETICHETTA_TIPO = { evento: 'Evento', appuntamento: 'Appuntamento', interno: 'Impegno interno', assenza: 'Assenza' };

const numero = (iso) => Number(iso.slice(8));
const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const minutiDi = (d) => d.getHours() * 60 + d.getMinutes();

/** «lunedì 16 novembre» (senza anno). */
export function giornoSenzaAnno(iso) {
  return formatoLungo(iso).replace(/ \d{4}$/, '');
}

/** Orario di una voce per elenchi e anteprime. */
export function orarioVoce(v) {
  const t = intervallo(v);
  if (t) return `${oraDaMinuti(t.inizio)} – ${oraDaMinuti(t.fine === MINUTI_GIORNO ? MINUTI_GIORNO - 1 : t.fine)}`;
  if (v.dataFine && v.dataFine > v.data) return `Dal ${formatoBreve(v.data)} al ${formatoBreve(v.dataFine)}`;
  if (v.tipo === 'evento' && v.fascia) return v.fascia;
  return 'Tutto il giorno';
}

/** Titolo della voce con la persona (senza ora: l'ora sta nel blocco). */
function titoloVoce(v) {
  return `${v.titolo}${v.persona ? ` (${v.persona})` : ''}`;
}

function etichettaAria(v) {
  return `${ETICHETTA_TIPO[v.tipo] || 'Voce'}: ${titoloVoce(v)}, ${orarioVoce(v)}`;
}

/** Selettore Giorno · Settimana · Mese. */
export function selettoreVista(vista, suVista) {
  return h('div', { class: 'cal-viste', role: 'group', 'aria-label': 'Vista del calendario' },
    [['giorno', 'Giorno'], ['settimana', 'Settimana'], ['mese', 'Mese']].map(([k, t]) => h('button', {
      type: 'button', class: ['cal-vista', k === vista && 'cal-vista--attiva'],
      'aria-pressed': k === vista ? 'true' : 'false', 'data-fuoco': `vista-${k}`,
      onClick: () => { if (k !== vista) suVista(k); },
    }, t)));
}

/** Scheda di una voce senza pagina propria (appuntamento, impegno, assenza): sola lettura. */
export function dettaglioVoce(ctx, v) {
  const righe = [
    ['Quando', `${maiuscola(formatoLungo(v.data))} · ${orarioVoce(v)}`],
    v.conChi ? ['Con', v.conChi] : null,
    v.persona ? ['Chi', v.persona] : null,
  ].filter(Boolean);
  apriFinestra({
    titolo: v.titolo,
    corpo: h('dl', { class: 'cal-dettaglio' },
      h('div', { class: 'cal-dettaglio-tipo' },
        h('span', { class: `cal-punto cal-punto--${v.tipo}`, 'aria-hidden': 'true' }), ETICHETTA_TIPO[v.tipo] || ''),
      righe.map(([k, val]) => h('div', { class: 'cal-dettaglio-riga' }, h('dt', {}, k), h('dd', {}, val)))),
    azioni: [
      { etichetta: 'Modifica', icona: 'lock-simple', azione: (chiudi) => { chiudi(); ctx.apriPopup('solaLettura'); } },
      { etichetta: 'Chiudi', variante: 'primario', autofocus: true },
    ],
  });
}

/** Menu «Aggiungi» del tocco su uno spazio vuoto, con giorno e ora già scelti. */
export function menuAggiungi(ctx, giorno, minuto) {
  const solaLettura = (chiudi) => { chiudi(); ctx.apriPopup('solaLettura'); };
  apriFinestra({
    titolo: 'Aggiungi',
    corpo: h('p', {}, `${maiuscola(formatoLungo(giorno))}, ore ${oraDaMinuti(minuto)}.`),
    classe: 'finestra--aggiungi',
    azioni: [
      { etichetta: 'Appuntamento', icona: 'handshake', azione: solaLettura },
      { etichetta: 'Evento interno', icona: 'briefcase', azione: solaLettura },
      {
        etichetta: 'Nuovo evento', icona: 'plus', variante: 'primario', autofocus: true,
        azione: (chiudi) => { chiudi(); ctx.vai(`#/eventi/nuovo?data=${giorno}`); },
      },
    ],
  });
}

function chip(v, suVoce, scelta) {
  return h('button', {
    type: 'button', class: ['tl-chip', `cal-voce cal-voce--${v.tipo}`, scelta && 'tl-scelta'],
    title: `${titoloVoce(v)} · ${orarioVoce(v)}`, 'aria-label': etichettaAria(v),
    onClick: (e) => { e.stopPropagation(); suVoce(v); },
  }, v.tipo === 'evento' && v.fascia ? `${v.titolo} · ${v.fascia}` : titoloVoce(v));
}

/** Scorre `el` a `top` appena è nel documento (la pagina viene montata dopo il render). */
function scorriQuandoMontato(el, top, tentativi = 5) {
  requestAnimationFrame(() => {
    if (el.isConnected) el.scrollTop = top;
    else if (tentativi > 0) scorriQuandoMontato(el, top, tentativi - 1);
  });
}

/**
 * Timeline di 24 ore per uno o più giorni, con la riga «tutto il giorno» in alto.
 * @param {{giorni:string[], voci:Array, oggi:string, suVoce:(v)=>void, suVuoto?:(giorno,minuto)=>void,
 *   suGiorno?:(iso)=>void, conTeste?:boolean, scelta?:{tipo,id}|null, classe?:string, scrollTop?:number}} p
 */
export function timeline({
  giorni, voci, oggi, suVoce, suVuoto = null, suGiorno = null, conTeste = true, scelta = null, classe, scrollTop,
}) {
  const adesso = new Date();
  const piu = giorni.length > 1;
  const separati = giorni.map((g) => separaGiorno(voci, g));
  const eScelta = (v) => !!scelta && v.tipo === scelta.tipo && v.id === scelta.id;
  const stile = { '--tl-colonne': String(giorni.length) };

  const teste = conTeste ? h('div', { class: 'tl-riga tl-teste', style: stile },
    h('span', { class: 'tl-angolo', 'aria-hidden': 'true' }),
    giorni.map((g, i) => h('button', {
      type: 'button', class: ['tl-testa', g === oggi && 'tl-testa--oggi'],
      'aria-label': `Apri ${formatoLungo(g)}`, 'data-fuoco': `testa-${g}`,
      onClick: () => suGiorno && suGiorno(g),
    }, h('span', { class: 'tl-testa-nome' }, NOMI[i % 7]), h('span', { class: 'tl-testa-num' }, String(numero(g)))))) : null;

  const tutto = h('div', { class: 'tl-riga tl-tutto', style: stile },
    h('span', { class: 'tl-etichetta' }, 'tutto il giorno'),
    separati.map(({ tuttoIlGiorno }, i) => {
      // In Settimana al massimo due voci e «+N» che apre il giorno; nel Giorno tutte.
      const limite = piu ? MAX_TUTTO_SETTIMANA : Infinity;
      const visibili = tuttoIlGiorno.length > limite ? tuttoIlGiorno.slice(0, limite - 1) : tuttoIlGiorno;
      const altre = tuttoIlGiorno.length - visibili.length;
      return h('div', { class: 'tl-tutto-cella' },
        visibili.map((v) => chip(v, suVoce, eScelta(v))),
        altre > 0 ? h('button', {
          type: 'button', class: 'tl-piu',
          'aria-label': `Altre ${altre} voci di ${formatoLungo(giorni[i])}: apri il giorno`,
          onClick: () => suGiorno && suGiorno(giorni[i]),
        }, `+${altre}`) : null);
    }));

  const ore = h('div', { class: 'tl-ore', 'aria-hidden': 'true' },
    Array.from({ length: 23 }, (_, i) => h('span', { class: 'tl-ora', style: { top: `${(i + 1) * 60 * PX_MINUTO}px` } },
      `${String(i + 1).padStart(2, '0')}:00`)));

  let lineaAdesso = null;
  const colonne = giorni.map((g, i) => {
    const colonna = h('div', {
      class: ['tl-colonna', g === oggi && 'tl-colonna--oggi', suVuoto && 'tl-colonna--tocco'],
      onClick: suVuoto ? (e) => {
        if (e.target.closest('.tl-blocco')) return;
        const y = e.clientY - colonna.getBoundingClientRect().top;
        suVuoto(g, minutoDaTocco(y, PX_MINUTO));
      } : null,
    },
    separati[i].blocchi.map((b) => {
      const top = Math.min(b.inizio, MINUTI_GIORNO - 20) * PX_MINUTO;
      const altezza = Math.max((b.fine - b.inizio) * PX_MINUTO, 18);
      const larga = 100 / b.colonne;
      return h('button', {
        type: 'button', class: ['tl-blocco', `tl-blocco--${b.voce.tipo}`, eScelta(b.voce) && 'tl-scelta',
          altezza < 34 && 'tl-blocco--basso'],
        style: { top: `${top}px`, height: `${altezza}px`, left: `calc(${b.colonna * larga}% + 1px)`, width: `calc(${larga}% - 3px)` },
        title: `${titoloVoce(b.voce)} · ${orarioVoce(b.voce)}`, 'aria-label': etichettaAria(b.voce),
        onClick: (e) => { e.stopPropagation(); suVoce(b.voce); },
      },
      h('span', { class: 'tl-blocco-titolo' }, titoloVoce(b.voce)),
      h('span', { class: 'tl-blocco-ora' }, orarioVoce(b.voce)));
    }));
    if (g === oggi) {
      lineaAdesso = h('div', { class: 'tl-adesso', 'aria-hidden': 'true', style: { top: `${minutiDi(adesso) * PX_MINUTO}px` } });
      colonna.append(lineaAdesso);
    }
    return colonna;
  });

  const griglia = h('div', { class: 'tl-griglia', style: { ...stile, height: `${MINUTI_GIORNO * PX_MINUTO}px` } }, ore, colonne);
  const corpo = h('div', { class: 'tl-corpo', tabindex: '0', 'aria-label': 'Ore del giorno' }, griglia);
  scorriQuandoMontato(corpo, scrollTop ?? minutoIniziale(giorni, oggi, minutiDi(adesso)) * PX_MINUTO);

  // La linea dell'ora attuale si sposta ogni minuto finché la timeline è in pagina.
  if (lineaAdesso) {
    const timer = setInterval(() => {
      if (!lineaAdesso.isConnected) { clearInterval(timer); return; }
      lineaAdesso.style.top = `${minutiDi(new Date()) * PX_MINUTO}px`;
    }, 60000);
  }

  return h('div', { class: ['tl', piu ? 'tl--settimana' : 'tl--giorno', classe] }, teste, tutto, corpo);
}

/** Mini-calendario del mese, per la colonna destra del Giorno. */
function miniMese(giorno, voci, oggi, suGiorno) {
  const [anno, mese] = giorno.split('-').map(Number);
  return h('div', { class: 'mini-mese' },
    h('div', { class: 'mini-mese-testa' },
      h('button', {
        type: 'button', class: 'btn-icona', 'aria-label': 'Mese precedente', 'data-fuoco': 'mini-prec',
        onClick: () => suGiorno(aggiungiMesi(giorno, -1)),
      }, icona('caret-left')),
      h('span', { class: 'mini-mese-titolo' }, `${nomeMese(mese - 1)} ${anno}`),
      h('button', {
        type: 'button', class: 'btn-icona', 'aria-label': 'Mese successivo', 'data-fuoco': 'mini-succ',
        onClick: () => suGiorno(aggiungiMesi(giorno, 1)),
      }, icona('caret-right'))),
    h('div', { class: 'mini-mese-griglia' },
      INIZIALI.map((l) => h('span', { class: 'mini-mese-nome', 'aria-hidden': 'true' }, l)),
      grigliaMese(anno, mese).map(({ iso, delMese }) => h('button', {
        type: 'button',
        class: ['mini-giorno', !delMese && 'mini-giorno--fuori', iso === oggi && 'mini-giorno--oggi',
          iso === giorno && 'mini-giorno--scelto', vociDelGiorno(voci, iso).length && 'mini-giorno--pieno'],
        'aria-label': formatoLungo(iso), 'aria-pressed': iso === giorno ? 'true' : 'false',
        'data-fuoco': `mini-${iso}`,
        onClick: () => suGiorno(iso),
      }, String(numero(iso))))));
}

function anteprima(v, apri) {
  if (!v) {
    return h('div', { class: 'cal-anteprima cal-anteprima--vuota' },
      h('p', {}, 'Tocca una voce della giornata per vederne i dettagli qui.'));
  }
  return h('div', { class: 'cal-anteprima' },
    h('div', { class: 'cal-dettaglio-tipo' },
      h('span', { class: `cal-punto cal-punto--${v.tipo}`, 'aria-hidden': 'true' }), ETICHETTA_TIPO[v.tipo] || ''),
    h('h3', { class: 'cal-anteprima-titolo' }, v.titolo),
    h('p', { class: 'cal-anteprima-ora' }, orarioVoce(v)),
    v.conChi ? h('p', { class: 'cal-anteprima-extra' }, `Con ${v.conChi}`) : null,
    v.persona ? h('p', { class: 'cal-anteprima-extra' }, v.persona) : null,
    h('button', { type: 'button', class: 'btn btn-secondario btn-sm', 'data-fuoco': 'anteprima-apri', onClick: () => apri(v) },
      h('span', {}, 'Apri'), icona('arrow-right')));
}

/**
 * Giorno da computer: timeline a sinistra; a destra mini-calendario e anteprima della voce scelta.
 * La scelta della voce si ridisegna sul posto, senza cambiare indirizzo.
 */
export function giornoDesktop({ giorno, voci, oggi, suVuoto, suGiorno, apri, stato }) {
  const zona = h('div', { class: 'cal-giorno-desktop' });
  function disegna() {
    const vecchio = zona.querySelector('.tl-corpo');
    const scelta = stato.scelta && stato.scelta.giorno === giorno
      ? voci.find((v) => v.tipo === stato.scelta.tipo && v.id === stato.scelta.id) || null
      : null;
    zona.replaceChildren(
      timeline({
        giorni: [giorno], voci, oggi, suVuoto, conTeste: false, scelta,
        scrollTop: vecchio ? vecchio.scrollTop : undefined,
        suVoce: (v) => { stato.scelta = { giorno, tipo: v.tipo, id: v.id }; disegna(); },
      }),
      h('aside', { class: 'cal-giorno-lato' }, miniMese(giorno, voci, oggi, suGiorno), anteprima(scelta, apri)));
  }
  disegna();
  return zona;
}

/** Striscia della settimana del Giorno da telefono; si scorre col dito per cambiare settimana. */
function strisciaSettimana(giorno, voci, oggi, suGiorno) {
  const giorni = giorniSettimana(giorno);
  let x0 = null;
  return h('div', {
    class: 'striscia',
    onTouchstart: (e) => { x0 = e.touches[0].clientX; },
    onTouchend: (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) suGiorno(null, dx < 0 ? 7 : -7);
    },
  },
  h('button', { type: 'button', class: 'btn-icona striscia-freccia', 'aria-label': 'Settimana precedente', onClick: () => suGiorno(null, -7) }, icona('caret-left')),
  h('div', { class: 'striscia-giorni' },
    giorni.map((g, i) => h('button', {
      type: 'button', class: ['striscia-giorno', g === giorno && 'striscia-giorno--scelto', g === oggi && 'striscia-giorno--oggi'],
      'aria-label': formatoLungo(g), 'aria-pressed': g === giorno ? 'true' : 'false', 'data-fuoco': `striscia-${g}`,
      onClick: () => suGiorno(g),
    },
    h('span', { class: 'striscia-nome' }, INIZIALI[i]),
    h('span', { class: 'striscia-num' }, String(numero(g))),
    h('span', { class: ['striscia-punto', vociDelGiorno(voci, g).length && 'striscia-punto--pieno'], 'aria-hidden': 'true' })))),
  h('button', { type: 'button', class: 'btn-icona striscia-freccia', 'aria-label': 'Settimana successiva', onClick: () => suGiorno(null, 7) }, icona('caret-right')));
}

/**
 * Giorno da telefono: «‹ Mese», striscia della settimana, timeline a schermo pieno.
 * `suGiorno(iso)` apre quel giorno; `suGiorno(null, n)` sposta di n giorni.
 */
export function giornoTelefono({ giorno, voci, oggi, suVoce, suVuoto, suGiorno, suMese }) {
  const [, mese] = giorno.split('-').map(Number);
  return h('div', { class: 'cal-giorno-telefono' },
    h('button', { type: 'button', class: 'btn btn-link cal-torna-mese', 'data-fuoco': 'torna-mese', onClick: suMese },
      icona('caret-left'), h('span', {}, nomeMese(mese - 1))),
    strisciaSettimana(giorno, voci, oggi, suGiorno),
    h('h2', { class: 'cal-giorno-titolo cal-giorno-titolo--telefono' }, formatoLungo(giorno)),
    timeline({ giorni: [giorno], voci, oggi, suVoce, suVuoto, conTeste: false, classe: 'tl--telefono' }));
}

/** Settimana da telefono: un giorno sotto l'altro, anche quelli vuoti (come Calendar su iPhone). */
export function settimanaLista({ giorno, voci, oggi, suVoce, suGiorno }) {
  return h('ol', { class: 'sett-lista' }, giorniSettimana(giorno).map((g) => {
    const del = listaGiorno(voci, g);
    return h('li', { class: ['sett-giorno', g === oggi && 'sett-giorno--oggi'] },
      h('button', { type: 'button', class: 'sett-testa', 'data-fuoco': `sett-${g}`, onClick: () => suGiorno(g) },
        h('span', {}, maiuscola(giornoSenzaAnno(g))), g === oggi ? h('span', { class: 'sett-oggi' }, 'Oggi') : null),
      del.length
        ? h('ul', { class: 'sett-voci' }, del.map((v) => h('li', {},
          h('button', { type: 'button', class: `sett-voce sett-voce--${v.tipo}`, 'aria-label': etichettaAria(v), onClick: () => suVoce(v) },
            h('span', { class: `cal-punto cal-punto--${v.tipo}`, 'aria-hidden': 'true' }),
            h('span', { class: 'sett-voce-titolo' }, titoloVoce(v)),
            h('span', { class: 'sett-voce-ora' }, orarioVoce(v))))))
        : h('p', { class: 'sett-vuoto' }, 'Niente in programma'));
  }));
}

