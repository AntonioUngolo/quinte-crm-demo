// Azioni sui dati della demo: mutano `dati` direttamente.
import { ID_ARTISTA_DEMO } from './seed.js';

function nuovoId(prefisso) {
  return `${prefisso}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const trovaEvento = (dati, id) => dati.eventi.find((e) => e.id === id) || null;

export function creaEvento(dati, campi = {}) {
  const evento = {
    titolo: '', tipo: 'Matrimonio', stato: 'Da ricontattare', data: '', fascia: 'Cena', invitati: 0,
    locationId: null, chiesaId: null, rito: null, clienteId: null, provenienza: '', referente: '', note: '',
    totale: 0,
    ...campi,
    id: nuovoId('ev'),
    siae: campi.siae ?? false,
    acconti: campi.acconti ?? [],
    cast: campi.cast ?? [],
    musica: campi.musica ?? [],
    contratti: campi.contratti ?? [],
    storicoDate: campi.storicoDate ?? [],
    allestimento: campi.allestimento ?? { serviceId: null, note: '' },
    daUtente: true,
  };
  dati.eventi.push(evento);
  return evento;
}

export function modificaEvento(dati, id, campi) {
  const e = trovaEvento(dati, id);
  if (!e) return false;
  const { id: _ignora, ...resto } = campi || {};
  Object.assign(e, resto);
  if (resto.data) {
    for (const sp of dati.spese) if (sp.origine === 'cachet' && sp.eventoId === id) sp.data = e.data;
  }
  return true;
}

export function eliminaEvento(dati, id) {
  const i = dati.eventi.findIndex((e) => e.id === id);
  if (i < 0) return false;
  dati.eventi.splice(i, 1);
  dati.spese = dati.spese.filter((s) => s.eventoId !== id);
  return true;
}

const idCachet = (eventoId, artistaId) => `sc-${eventoId}-${artistaId}`;
const trovaCachet = (dati, eventoId, artistaId) =>
  dati.spese.find((s) => s.origine === 'cachet' && s.eventoId === eventoId && s.artistaId === artistaId);

export function assegnaArtista(dati, eventoId, { artistaId, momento, cachet, dressCode }) {
  if (artistaId !== ID_ARTISTA_DEMO) return false;
  const e = trovaEvento(dati, eventoId);
  const artista = dati.artisti.find((a) => a.id === artistaId);
  if (!e || !artista || e.cast.some((c) => c.artistaId === artistaId)) return false;
  e.cast.push({ artistaId, momento, cachet, dressCode, statoIncarico: 'In attesa' });
  dati.spese.push({
    id: idCachet(eventoId, artistaId), data: e.data, voce: 'Cachet · ' + artista.nome, categoria: 'Cachet',
    importo: cachet, eventoId, origine: 'cachet', artistaId,
  });
  return true;
}

export function modificaIncarico(dati, eventoId, artistaId, campi) {
  const e = trovaEvento(dati, eventoId);
  const inc = e && e.cast.find((c) => c.artistaId === artistaId);
  if (!inc) return false;
  const { artistaId: _ignora, ...resto } = campi || {};
  Object.assign(inc, resto);
  const spesa = trovaCachet(dati, eventoId, artistaId);
  if (spesa) spesa.importo = inc.cachet;
  return true;
}

export function togliArtista(dati, eventoId, artistaId) {
  const e = trovaEvento(dati, eventoId);
  const i = e ? e.cast.findIndex((c) => c.artistaId === artistaId) : -1;
  if (i < 0) return false;
  e.cast.splice(i, 1);
  dati.spese = dati.spese.filter((s) => !(s.origine === 'cachet' && s.eventoId === eventoId && s.artistaId === artistaId));
  return true;
}

export function aggiungiSpesa(dati, { data, voce, categoria, importo, eventoId = null }) {
  const spesa = {
    id: nuovoId('sp'), data, voce, categoria, importo, eventoId: eventoId || null, origine: 'manuale', artistaId: null,
  };
  dati.spese.push(spesa);
  return spesa;
}

export function eliminaSpesa(dati, id) {
  const i = dati.spese.findIndex((s) => s.id === id);
  if (i < 0 || dati.spese[i].origine === 'cachet') return false;
  dati.spese.splice(i, 1);
  return true;
}
