// Conti come nell'app vera: margine cast = totale − cachet; utile = totale − spese dell'evento.

import { aggiungiMesi } from './date.js';

const somma = (xs) => xs.reduce((t, x) => t + x, 0);
const anno = (iso) => Number(iso.slice(0, 4));
const mese = (iso) => Number(iso.slice(5, 7));
const arrotonda = (n) => Math.round(n * 100) / 100;

export const totaleCachet = (evento) => arrotonda(somma((evento.cast || []).map((c) => c.cachet || 0)));
export const margineCast = (evento) => arrotonda(evento.totale - totaleCachet(evento));
export const speseEvento = (dati, eventoId) => dati.spese.filter((s) => s.eventoId === eventoId);
export const utileEvento = (dati, evento) =>
  arrotonda(evento.totale - somma(speseEvento(dati, evento.id).map((s) => s.importo)));
/** true se il totale concordato manca (0 o vuoto): il margine non ha senso. */
export const senzaTotale = (evento) => !(Number(evento.totale) > 0);
export const incassato = (evento) => arrotonda(somma((evento.acconti || []).map((a) => a.importo)));
export const saldo = (evento) => arrotonda(evento.totale - incassato(evento));

const STATI_FUORI = ['Cancellato', 'Sospeso', 'Completato'];

/** Indicatori su una finestra mobile: da oggi (compreso) fino a oggi + 12 mesi (escluso), eventi in programma. */
export function kpiDashboard(dati, oggiISO) {
  const fine = aggiungiMesi(oggiISO, 12);
  const eventi = dati.eventi.filter((e) => !STATI_FUORI.includes(e.stato)
    && e.data && e.data >= oggiISO && e.data < fine);
  return {
    confermati: eventi.filter((e) => e.stato === 'Confermato').length,
    totaleProgramma: eventi.length,
    utileStimato: arrotonda(somma(eventi.map((e) => utileEvento(dati, e)))),
    acconti: arrotonda(somma(eventi.map(incassato))),
    totaleDaIncassare: arrotonda(somma(eventi.map((e) => e.totale))),
    artisti: dati.artisti.length,
  };
}

// undefined, null e stringa vuota significano «nessun filtro».
const vuoto = (v) => v === undefined || v === null || v === '';

export function movimenti(dati, filtri = {}) {
  const { anno: fa, mese: fm, tipo } = filtri || {};
  const out = [];
  for (const e of dati.eventi) {
    for (const ac of e.acconti || []) {
      out.push({ data: ac.data, voce: e.titolo, categoria: 'Acconto', importo: ac.importo, tipo: 'Entrata', eventoId: e.id });
    }
  }
  for (const s of dati.spese) {
    out.push({ data: s.data, voce: s.voce, categoria: s.categoria, importo: s.importo, tipo: 'Uscita', eventoId: s.eventoId, spesaId: s.id, origine: s.origine });
  }
  return out
    .filter((m) => (vuoto(fa) || anno(m.data) === Number(fa))
      && (vuoto(fm) || mese(m.data) === Number(fm))
      && (vuoto(tipo) || m.tipo === tipo))
    .sort((x, y) => (x.data < y.data ? 1 : x.data > y.data ? -1 : 0));
}

export function riepilogoMensile(dati, a) {
  const tutti = movimenti(dati, { anno: a });
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const del = tutti.filter((x) => mese(x.data) === m);
    const entrate = arrotonda(somma(del.filter((x) => x.tipo === 'Entrata').map((x) => x.importo)));
    const uscite = arrotonda(somma(del.filter((x) => x.tipo === 'Uscita').map((x) => x.importo)));
    return { mese: m, entrate, uscite, margine: arrotonda(entrate - uscite) };
  });
}

export function spesePerCategoria(dati, a) {
  const per = new Map();
  for (const s of dati.spese) {
    if (anno(s.data) !== a) continue;
    per.set(s.categoria, (per.get(s.categoria) || 0) + s.importo);
  }
  return [...per].map(([categoria, totale]) => ({ categoria, totale: arrotonda(totale) }))
    .sort((x, y) => y.totale - x.totale);
}
