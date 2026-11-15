// Logica del calendario senza DOM: voci da mostrare e giorni della griglia.
import { aggiungiGiorni } from './date.js';

const due = (n) => String(n).padStart(2, '0');

/**
 * Voci del calendario del titolare.
 * Con `artistaId` solo gli eventi in cui l'artista è nel cast (appuntamenti e agenda nascosti).
 * Gli eventi cancellati non compaiono.
 */
export function vociCalendario(dati, { artistaId = null } = {}) {
  const voci = dati.eventi
    .filter((e) => e.data && e.stato !== 'Cancellato')
    .filter((e) => !artistaId || (e.cast || []).some((c) => c.artistaId === artistaId))
    .map((e) => ({
      id: e.id, data: e.data, titolo: e.titolo || 'Senza titolo', tipo: 'evento',
      hash: `#/eventi/${encodeURIComponent(e.id)}`, daUtente: !!e.daUtente,
      ...(e.fascia ? { fascia: e.fascia } : {}),
    }));
  if (artistaId) return voci;
  for (const a of dati.appuntamenti || []) {
    if (!a.data) continue;
    const voce = { id: a.id, data: a.data, titolo: a.titolo || 'Appuntamento', tipo: 'appuntamento', ora: a.ora || '' };
    if (Number(a.durata) > 0) voce.durata = Number(a.durata);
    if (a.conChi) voce.conChi = a.conChi;
    voci.push(voce);
  }
  for (const a of dati.agenda || []) {
    if (!a.data) continue;
    const voce = {
      id: a.id, data: a.data, titolo: a.titolo || (a.tipo === 'Assenza' ? 'Assenza' : 'Impegno'),
      tipo: a.tipo === 'Assenza' ? 'assenza' : 'interno',
    };
    if (a.persona) voce.persona = a.persona;
    if (a.dataFine && a.dataFine > a.data) voce.dataFine = a.dataFine;
    if (a.ora) voce.ora = a.ora;
    if (a.oraFine) voce.oraFine = a.oraFine;
    voci.push(voce);
  }
  return voci;
}

/** Giorni della griglia del mese (`mese` 1-12): settimane intere, da lunedì a domenica. */
export function grigliaMese(anno, mese) {
  const primo = `${anno}-${due(mese)}-01`;
  const giornoSett = new Date(Date.UTC(anno, mese - 1, 1)).getUTCDay(); // 0 = domenica
  const indietro = (giornoSett + 6) % 7;
  const ultimo = new Date(Date.UTC(anno, mese, 0)).getUTCDate();
  const celle = Math.ceil((indietro + ultimo) / 7) * 7;
  const inizio = aggiungiGiorni(primo, -indietro);
  const prefisso = `${anno}-${due(mese)}-`;
  return Array.from({ length: celle }, (_, i) => {
    const iso = aggiungiGiorni(inizio, i);
    return { iso, delMese: iso.startsWith(prefisso) };
  });
}
