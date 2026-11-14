// Esportazione CSV dei movimenti (formato italiano, apribile in Excel).
import { formatoBreve } from './date.js';

const BOM = '﻿';
const INTESTAZIONE = ['Data', 'Voce', 'Categoria', 'Tipo', 'Importo'];

// Testi che iniziano con = + - @ sarebbero formule in Excel: si prefissa un apice (solo ai testi, non ai numeri).
const testo = (v) => (/^[=+\-@]/.test(String(v ?? '')) ? `'${v}` : v);

function campo(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function importo(n) {
  const a = Math.abs(Number(n) || 0);
  const cent = Math.round(a * 100);
  const intero = Math.floor(cent / 100);
  const dec = cent % 100;
  return dec === 0 ? String(intero) : `${intero},${String(dec).padStart(2, '0')}`;
}

export function movimentiCSV(righe) {
  const linee = [INTESTAZIONE.join(';')];
  for (const r of righe) {
    linee.push([formatoBreve(r.data), testo(r.voce), testo(r.categoria), r.tipo, importo(r.importo)].map(campo).join(';'));
  }
  return BOM + linee.join('\r\n');
}
