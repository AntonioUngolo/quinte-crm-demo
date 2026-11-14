// Rotte a hash. Il confronto ignora la parte dopo «?», che finisce in params.

export const ROTTE = [
  { pattern: '#/', pagina: 'dashboard', ruolo: 'titolare' },
  { pattern: '#/eventi', pagina: 'eventi', ruolo: 'titolare' },
  { pattern: '#/eventi/nuovo', pagina: 'evento-nuovo', ruolo: 'titolare' },
  { pattern: '#/eventi/:id', pagina: 'evento-scheda', ruolo: 'titolare' },
  { pattern: '#/eventi/:id/modifica', pagina: 'evento-modifica', ruolo: 'titolare' },
  { pattern: '#/eventi/:id/chat', pagina: 'evento-chat', ruolo: 'titolare' },
  { pattern: '#/archivio/:stato', pagina: 'archivio', ruolo: 'titolare' },
  { pattern: '#/calendario', pagina: 'calendario', ruolo: 'titolare' },
  { pattern: '#/artisti', pagina: 'artisti', ruolo: 'titolare' },
  { pattern: '#/artisti/:id', pagina: 'artista-scheda', ruolo: 'titolare' },
  { pattern: '#/clienti', pagina: 'clienti', ruolo: 'titolare' },
  { pattern: '#/clienti/:id', pagina: 'cliente-scheda', ruolo: 'titolare' },
  { pattern: '#/location', pagina: 'location', ruolo: 'titolare' },
  { pattern: '#/chiese', pagina: 'chiese', ruolo: 'titolare' },
  { pattern: '#/appuntamenti', pagina: 'appuntamenti', ruolo: 'titolare' },
  { pattern: '#/service', pagina: 'service', ruolo: 'titolare' },
  { pattern: '#/finanze', pagina: 'finanze', ruolo: 'titolare' },
  { pattern: '#/opzioni', pagina: 'opzioni', ruolo: 'titolare' },

  { pattern: '#/artista', pagina: 'artista-home', ruolo: 'artista' },
  { pattern: '#/artista/eventi', pagina: 'artista-eventi', ruolo: 'artista' },
  { pattern: '#/artista/eventi/:id', pagina: 'artista-evento', ruolo: 'artista' },
  { pattern: '#/artista/calendario', pagina: 'artista-calendario', ruolo: 'artista' },
  { pattern: '#/artista/location', pagina: 'artista-location', ruolo: 'artista' },
  { pattern: '#/artista/chiese', pagina: 'artista-chiese', ruolo: 'artista' },
  { pattern: '#/artista/profilo', pagina: 'artista-profilo', ruolo: 'artista' },

  { pattern: '#/cliente', pagina: 'cliente-home', ruolo: 'cliente' },
  { pattern: '#/cliente/eventi/:id', pagina: 'cliente-evento', ruolo: 'cliente' },
  { pattern: '#/cliente/profilo', pagina: 'cliente-profilo', ruolo: 'cliente' },
];

const HOME = { titolare: 'dashboard', artista: 'artista-home', cliente: 'cliente-home' };

function decodifica(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function parti(path) {
  return path.split('/').filter((x) => x !== '');
}

function confronta(pattern, segmenti) {
  const p = parti(pattern.slice(1));
  if (p.length !== segmenti.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodifica(segmenti[i]);
    else if (p[i] !== segmenti[i]) return null;
  }
  return params;
}

export function risolvi(hash, ruolo) {
  const h = String(hash || '');
  const q = h.indexOf('?');
  const path = q === -1 ? h : h.slice(0, q);
  const query = q === -1 ? '' : h.slice(q + 1);
  const segmenti = parti(path.replace(/^#/, ''));
  const home = { pagina: HOME[ruolo] || HOME.titolare, params: {} };

  // Le rotte statiche precedono quelle con :param, a parità di lunghezza.
  const candidate = ROTTE.filter((r) => r.ruolo === ruolo)
    .sort((a, b) => a.pattern.split(':').length - b.pattern.split(':').length);
  for (const r of candidate) {
    const params = confronta(r.pattern, segmenti);
    if (!params) continue;
    for (const coppia of query.split('&')) {
      if (!coppia) continue;
      const i = coppia.indexOf('=');
      const k = decodifica(i === -1 ? coppia : coppia.slice(0, i));
      const v = i === -1 ? '' : decodifica(coppia.slice(i + 1));
      if (!(k in params)) params[k] = v;
    }
    return { pagina: r.pagina, params };
  }
  return home;
}
