// Logica delle viste Giorno · Settimana · Mese, senza DOM (come nell'app, punto 24.1).
import { aggiungiGiorni, aggiungiMesi, nomeMese } from './date.js';

export const VISTE = ['giorno', 'settimana', 'mese'];
export const MINUTI_GIORNO = 24 * 60;
/** Durata di un blocco quando la voce ha l'ora ma non la durata. */
export const DURATA_PREDEFINITA = 60;

const MESI_MINUSCOLI = Array.from({ length: 12 }, (_, i) => nomeMese(i).toLowerCase());
const FORMATO_ISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const eDataISO = (s) => typeof s === 'string' && FORMATO_ISO.test(s);

function giornoSettimana(iso) {
  const [a, m, g] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g)).getUTCDay(); // 0 = domenica
}

/** Il lunedì della settimana di `iso`. */
export function lunediDi(iso) {
  return aggiungiGiorni(iso, -((giornoSettimana(iso) + 6) % 7));
}

/** I 7 giorni (lunedì-domenica) della settimana di `iso`. */
export function giorniSettimana(iso) {
  const lunedi = lunediDi(iso);
  return Array.from({ length: 7 }, (_, i) => aggiungiGiorni(lunedi, i));
}

/** ‹ › : un giorno, una settimana o un mese (`verso` = -1 o 1). */
export function sposta(vista, iso, verso) {
  if (vista === 'mese') return aggiungiMesi(iso, verso);
  return aggiungiGiorni(iso, vista === 'settimana' ? 7 * verso : verso);
}

/**
 * Data di partenza quando dal Mese si passa a Giorno o Settimana:
 * il giorno selezionato se è nel mese, altrimenti oggi se è nel mese, altrimenti il primo.
 */
export function dataDaMese(meseISO, giornoScelto, oggi) {
  if (giornoScelto && giornoScelto.startsWith(meseISO)) return giornoScelto;
  if (oggi.startsWith(meseISO)) return oggi;
  return `${meseISO}-01`;
}

/** «16 – 22 novembre 2026», «30 novembre – 6 dicembre 2026», «29 dicembre 2026 – 4 gennaio 2027». */
export function titoloSettimana(iso) {
  const giorni = giorniSettimana(iso);
  const [a1, m1, g1] = giorni[0].split('-').map(Number);
  const [a2, m2, g2] = giorni[6].split('-').map(Number);
  if (a1 !== a2) return `${g1} ${MESI_MINUSCOLI[m1 - 1]} ${a1} – ${g2} ${MESI_MINUSCOLI[m2 - 1]} ${a2}`;
  if (m1 !== m2) return `${g1} ${MESI_MINUSCOLI[m1 - 1]} – ${g2} ${MESI_MINUSCOLI[m2 - 1]} ${a2}`;
  return `${g1} – ${g2} ${MESI_MINUSCOLI[m2 - 1]} ${a2}`;
}

/** '10:30' → 630; null se non è un orario valido. */
export function minuti(ora) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(ora || '').trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** 630 → '10:30'. */
export function oraDaMinuti(min) {
  const m = Math.max(0, Math.min(MINUTI_GIORNO - 1, Math.round(min)));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/**
 * Inizio e fine in minuti di una voce con orario, o null se va nella riga «tutto il giorno».
 * Vanno nella riga: le voci senza ora, quelle su più giorni e gli eventi (matrimoni e feste).
 */
export function intervallo(v) {
  if (v.tipo === 'evento' || (v.dataFine && v.dataFine > v.data)) return null;
  const inizio = minuti(v.ora);
  if (inizio === null) return null;
  const fineScritta = minuti(v.oraFine);
  let fine = fineScritta !== null && fineScritta > inizio
    ? fineScritta
    : inizio + (Number(v.durata) > 0 ? Number(v.durata) : DURATA_PREDEFINITA);
  fine = Math.min(fine, MINUTI_GIORNO);
  return { inizio, fine };
}

const ORDINE_TIPO = { evento: 0, assenza: 1, interno: 2, appuntamento: 3 };

/** Ordine stabile della riga «tutto il giorno»: eventi, poi assenze, poi il resto; a parità l'ordine d'arrivo. */
function ordinaTuttoIlGiorno(voci) {
  return voci
    .map((v, i) => ({ v, i }))
    .sort((a, b) => (ORDINE_TIPO[a.v.tipo] ?? 9) - (ORDINE_TIPO[b.v.tipo] ?? 9) || a.i - b.i)
    .map((x) => x.v);
}

/** Voci che cadono nel giorno `iso` (anche quelle su più giorni). */
export function vociDelGiorno(voci, iso) {
  return voci.filter((v) => v.data <= iso && iso <= (v.dataFine || v.data));
}

/** Le voci di un giorno divise tra riga «tutto il giorno» e blocchi della timeline. */
export function separaGiorno(voci, iso) {
  const tutto = [];
  const blocchi = [];
  for (const v of vociDelGiorno(voci, iso)) {
    const t = intervallo(v);
    if (t) blocchi.push({ voce: v, ...t });
    else tutto.push(v);
  }
  return { tuttoIlGiorno: ordinaTuttoIlGiorno(tutto), blocchi: disponiBlocchi(blocchi) };
}

/**
 * Blocchi sovrapposti affiancati, come su Calendar di Apple: ogni gruppo di blocchi che si
 * toccano si divide in colonne; ogni blocco riceve `colonna` e `colonne` (quante nel gruppo).
 * Ordine stabile: per inizio, poi per fine più lontana, poi per ordine d'arrivo.
 */
export function disponiBlocchi(blocchi) {
  const ordinati = blocchi
    .map((b, i) => ({ ...b, i }))
    .sort((a, b) => a.inizio - b.inizio || b.fine - a.fine || a.i - b.i);
  const esito = [];
  let gruppo = [];
  let fineGruppo = -1;
  let colonneFine = [];
  const chiudi = () => {
    const n = colonneFine.length;
    for (const b of gruppo) esito.push({ ...b, colonne: n });
    gruppo = [];
    colonneFine = [];
  };
  for (const b of ordinati) {
    if (gruppo.length && b.inizio >= fineGruppo) chiudi();
    let col = colonneFine.findIndex((f) => f <= b.inizio);
    if (col === -1) { col = colonneFine.length; colonneFine.push(b.fine); } else colonneFine[col] = b.fine;
    gruppo.push({ ...b, colonna: col });
    fineGruppo = gruppo.length === 1 ? b.fine : Math.max(fineGruppo, b.fine);
  }
  if (gruppo.length) chiudi();
  return esito.map(({ i, ...b }) => b);
}

/** Voci di un giorno in lista: prima quelle di tutto il giorno, poi per orario (come la Settimana su iPhone). */
export function listaGiorno(voci, iso) {
  const { tuttoIlGiorno, blocchi } = separaGiorno(voci, iso);
  const perOra = [...blocchi].sort((a, b) => a.inizio - b.inizio || a.fine - b.fine).map((b) => b.voce);
  return [...tuttoIlGiorno, ...perOra];
}

/** Minuto in cui si apre la timeline: le 9, o un'ora prima di adesso se tra i giorni c'è oggi. */
export function minutoIniziale(giorni, oggi, adessoMinuti) {
  if (giorni.includes(oggi)) return Math.max(0, adessoMinuti - 60); // oltre la fine ci pensa lo scorrimento
  return 9 * 60;
}

/** Minuto toccato nella colonna, arrotondato alla mezz'ora sotto (per «Aggiungi»). */
export function minutoDaTocco(y, pxMinuto) {
  const m = Math.floor(y / pxMinuto / 30) * 30;
  return Math.max(0, Math.min(MINUTI_GIORNO - 30, m));
}
