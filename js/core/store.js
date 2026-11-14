// Salvataggio della demo in localStorage, con scadenza a 7 giorni dal primo ingresso.
import { oggiISO } from './date.js';

export const CHIAVE = 'quinte-demo';
export const VERSIONE = 1;
export const GIORNI_SCADENZA = 7;

const MS_GIORNO = 86400000;
const NOME_PREDEFINITO = 'La tua agenzia';
const NOME_MAX = 40;

/** Il nome resta testo: nessuna rimozione di tag, chi lo mostra usa textContent. */
export function pulisciNomeAgenzia(s) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return NOME_PREDEFINITO;
  return t.length > NOME_MAX ? `${t.slice(0, NOME_MAX - 1)}…` : t;
}

function nuoviDati(ora, creaDati) {
  const dati = creaDati(oggiISO(ora));
  dati.scadenza = ora.getTime() + GIORNI_SCADENZA * MS_GIORNO;
  dati.primoIngresso = oggiISO(ora);
  return dati;
}

/** Legge i dati salvati se validi, altrimenti ne crea di nuovi (senza salvarli). */
export function carica(storage, ora, creaDati) {
  try {
    const grezzo = storage ? storage.getItem(CHIAVE) : null;
    if (grezzo) {
      const dati = JSON.parse(grezzo);
      if (dati && dati.versione === VERSIONE && typeof dati.scadenza === 'number'
          && dati.scadenza >= ora.getTime()) {
        return { dati, nuovo: false };
      }
      // Salvataggio scaduto o di un'altra versione: si toglie anche dallo storage.
      try { storage.removeItem(CHIAVE); } catch (_) { /* storage in sola lettura: pazienza */ }
    }
  } catch (_) { /* storage non disponibile o JSON rotto: si riparte */ }
  return { dati: nuoviDati(ora, creaDati), nuovo: true };
}

/** true se salvato, false se lo storage non è disponibile o è pieno. */
export function salva(storage, dati) {
  try {
    storage.setItem(CHIAVE, JSON.stringify(dati));
    return true;
  } catch (_) {
    return false;
  }
}

/** Dati nuovi con scadenza ricalcolata; conserva il nome dell'agenzia. */
export function ricomincia(dati, ora, creaDati) {
  const nuovi = nuoviDati(ora, creaDati);
  nuovi.agenzia = dati.agenzia ?? nuovi.agenzia;
  return nuovi;
}
