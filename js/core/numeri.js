// Importi: lettura del formato italiano e visualizzazione. Senza Intl, per essere deterministici.

export function leggiImporto(s) {
  if (s === null || s === undefined) return null;
  const t = String(s).replace(/€/g, '').replace(/\s+/g, '');
  if (t === '' || t.startsWith('-')) return null;
  let normale;
  if (t.includes(',')) {
    // Formato italiano: punti = migliaia, virgola = decimali (una sola).
    if (!/^\d{1,3}(\.\d{3})*,\d+$|^\d+,\d+$|^\d+,$/.test(t)) return null;
    normale = t.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    normale = t.replace(/\./g, ''); // '1.500', '1.234.567'
  } else if (/^\d+(\.\d+)?$/.test(t)) {
    normale = t; // '300.5', '1500'
  } else {
    return null;
  }
  const n = Number(normale);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function conMigliaia(intero) {
  return String(intero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function euro(n) {
  const v = Math.round(Number(n) * 100) / 100;
  const neg = v < 0;
  const centesimi = Math.round(Math.abs(v) * 100);
  const intero = Math.floor(centesimi / 100);
  const dec = centesimi % 100;
  let testo = conMigliaia(intero);
  if (dec !== 0) testo += ',' + String(dec).padStart(2, '0');
  return '€ ' + (neg && centesimi !== 0 ? '-' : '') + testo;
}
