// Aree di Artista e Cliente: viste ridotte dei dati, costruite solo con i campi che quel ruolo può vedere.
// Le pagine disegnano queste viste e non toccano mai gli eventi interi: così totale, margini, spese,
// acconti e cachet degli altri non possono finire a schermo per errore.
import { incassato, saldo } from './calcoli.js';
import { vociCalendario } from './calendario.js';

const NASCOSTI_ARTISTA = ['Cancellato', 'Sospeso'];

const luogo = (l) => (l ? { nome: l.nome, citta: l.citta || '', indirizzo: l.indirizzo || '' } : null);

function trovaLuoghi(dati, e) {
  return {
    location: luogo(dati.location.find((l) => l.id === e.locationId)),
    chiesa: luogo(dati.chiese.find((c) => c.id === e.chiesaId)),
  };
}

function vistaIncarico(dati, e, c) {
  return {
    eventoId: e.id,
    titolo: e.titolo || 'Senza titolo',
    data: e.data || '',
    tipo: e.tipo,
    fascia: e.fascia,
    rito: e.rito || null,
    ...trovaLuoghi(dati, e),
    momento: c.momento,
    cachet: c.cachet || 0, // solo il suo
    dressCode: c.dressCode || '',
    statoIncarico: c.statoIncarico,
  };
}

/** Incarichi dell'artista, dal più vicino: un elemento per ogni evento in cui è nel cast. */
export function incarichiArtista(dati, artistaId) {
  const righe = [];
  for (const e of dati.eventi) {
    if (NASCOSTI_ARTISTA.includes(e.stato)) continue;
    const c = (e.cast || []).find((x) => x.artistaId === artistaId);
    if (c) righe.push(vistaIncarico(dati, e, c));
  }
  return righe.sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999'));
}

/** L'incarico dell'artista in un evento, o null se l'evento non esiste o non è suo. */
export function incaricoArtista(dati, artistaId, eventoId) {
  return incarichiArtista(dati, artistaId).find((i) => i.eventoId === eventoId) || null;
}

/** Cachet dell'anno: incarichi già accettati nei 12 mesi che partono da `oggi` (ISO). */
export function cachetAnno(incarichi, oggi) {
  const fine = `${Number(oggi.slice(0, 4)) + 1}${oggi.slice(4)}`;
  const tot = incarichi
    .filter((i) => i.statoIncarico === 'Accettato' && i.data >= oggi && i.data < fine)
    .reduce((s, i) => s + i.cachet, 0);
  return Math.round(tot * 100) / 100;
}

/** Voci del calendario dell'artista: i suoi eventi (con link all'area artista) e le date bloccate. */
export function vociCalendarioArtista(dati, artistaId) {
  const voci = vociCalendario(dati, { artistaId })
    .filter((v) => {
      const id = decodeURIComponent(v.hash.replace('#/eventi/', ''));
      const e = dati.eventi.find((x) => x.id === id);
      return e && !NASCOSTI_ARTISTA.includes(e.stato);
    })
    .map((v) => ({ ...v, hash: v.hash.replace('#/eventi/', '#/artista/eventi/') }));
  const a = dati.artisti.find((x) => x.id === artistaId);
  for (const d of (a && a.dateBloccate) || []) voci.push({ data: d, titolo: 'Data bloccata', tipo: 'assenza' });
  return voci;
}

function vistaClienteBreve(dati, e) {
  return {
    eventoId: e.id,
    titolo: e.titolo || 'Senza titolo',
    data: e.data || '',
    tipo: e.tipo,
    stato: e.stato,
    fascia: e.fascia,
    ...trovaLuoghi(dati, e),
  };
}

const eventiDelCliente = (dati, clienteId) =>
  dati.eventi.filter((e) => e.clienteId === clienteId && e.stato !== 'Cancellato');

/** Gli eventi del cliente (scheda breve, nessun importo). */
export function eventiCliente(dati, clienteId) {
  return eventiDelCliente(dati, clienteId)
    .map((e) => vistaClienteBreve(dati, e))
    .sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999'));
}

/** Evento visto dal cliente: pagamenti, artisti (nomi e momenti, senza cachet), musica, documenti. */
export function eventoCliente(dati, clienteId, eventoId) {
  const e = eventiDelCliente(dati, clienteId).find((x) => x.id === eventoId);
  if (!e) return null;
  const artisti = (e.cast || []).map((c) => {
    const a = dati.artisti.find((x) => x.id === c.artistaId);
    return { nome: a ? a.nome : 'Artista', ruolo: a ? a.ruolo : '', momento: c.momento };
  });
  return {
    ...vistaClienteBreve(dati, e),
    invitati: e.invitati || 0,
    rito: e.rito || null,
    referente: e.referente || '',
    pagamenti: {
      totale: e.totale || 0,
      incassato: incassato(e),
      saldo: saldo(e),
      acconti: (e.acconti || []).map((a) => ({ importo: a.importo, data: a.data })),
    },
    artisti,
    musica: (e.musica || []).map((m) => ({ momento: m.momento, brani: [...(m.brani || [])] })),
    // «Contratto artisti» è un documento interno dell'agenzia.
    contratti: (e.contratti || []).filter((c) => c.tipo !== 'Contratto artisti').map((c) => ({ tipo: c.tipo, stato: c.stato })),
  };
}

/**
 * Location o chiese degli eventi dell'artista, con quanti dei SUOI eventi ci passano.
 * tipo: 'location' | 'chiese'. Niente luoghi di eventi in cui non è nel cast.
 */
export function luoghiArtista(dati, artistaId, tipo) {
  const campo = tipo === 'chiese' ? 'chiesaId' : 'locationId';
  const conteggi = new Map();
  for (const e of dati.eventi) {
    if (NASCOSTI_ARTISTA.includes(e.stato) || !e[campo]) continue;
    if (!(e.cast || []).some((c) => c.artistaId === artistaId)) continue;
    conteggi.set(e[campo], (conteggi.get(e[campo]) || 0) + 1);
  }
  return dati[tipo === 'chiese' ? 'chiese' : 'location']
    .filter((l) => conteggi.has(l.id))
    .map((l) => ({ ...l, eventi: conteggi.get(l.id) }));
}
