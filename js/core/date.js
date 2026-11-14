// Date in formato ISO (YYYY-MM-DD). Calcoli in UTC per evitare salti dell'ora legale.
const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio',
  'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MS_GIORNO = 86400000;

const due = (n) => String(n).padStart(2, '0');

function daISO(iso) {
  const [a, m, g] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g));
}

function inISO(d) {
  return `${d.getUTCFullYear()}-${due(d.getUTCMonth() + 1)}-${due(d.getUTCDate())}`;
}

/** Data locale di `d` come ISO. */
export function oggiISO(d) {
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
}

export function aggiungiGiorni(iso, n) {
  const d = daISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return inISO(d);
}

/** Aggiunge mesi limitando il giorno alla fine del mese di arrivo. */
export function aggiungiMesi(iso, n) {
  const d = daISO(iso);
  const giorno = d.getUTCDate();
  const primo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const ultimo = new Date(Date.UTC(primo.getUTCFullYear(), primo.getUTCMonth() + 1, 0)).getUTCDate();
  primo.setUTCDate(Math.min(giorno, ultimo));
  return inISO(primo);
}

export function formatoBreve(iso) {
  const [a, m, g] = iso.split('-');
  return `${g}/${m}/${a}`;
}

export function formatoLungo(iso) {
  const d = daISO(iso);
  return `${GIORNI[d.getUTCDay()]} ${d.getUTCDate()} ${MESI[d.getUTCMonth()].toLowerCase()} ${d.getUTCFullYear()}`;
}

/** Giorni da isoA a isoB (negativo se B precede A). */
export function giorniTra(isoA, isoB) {
  return Math.round((daISO(isoB) - daISO(isoA)) / MS_GIORNO);
}

/** `m0` = indice del mese da 0 (0 = Gennaio). */
export function nomeMese(m0) {
  return MESI[m0];
}
