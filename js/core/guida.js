// Guida «Prova in 5 minuti»: sei passi, stato dentro dati.guida. Nessun DOM.

function ultimoEventoUtente(dati) {
  const mio = (dati.eventi || []).filter((e) => e.daUtente);
  return mio.length ? mio[mio.length - 1] : null;
}

export const PASSI = [
  {
    id: 'dashboard',
    titolo: 'Guarda la dashboard',
    spiegazione: 'Qui vedi a colpo d\'occhio eventi, scadenze e incassi.',
    destinazione: () => '#/',
  },
  {
    id: 'evento',
    titolo: 'Crea un evento',
    spiegazione: 'Inserisci data, cliente e totale concordato: ci vuole un minuto.',
    destinazione: () => '#/eventi/nuovo',
  },
  {
    id: 'cast',
    titolo: 'Componi il cast',
    spiegazione: 'Assegna l\'artista della demo al tuo evento con momento e cachet.',
    destinazione: (dati) => {
      const e = ultimoEventoUtente(dati);
      return e ? `#/eventi/${encodeURIComponent(e.id)}?sezione=cast` : '#/eventi';
    },
  },
  {
    id: 'calendario',
    titolo: 'Trovalo nel calendario',
    spiegazione: 'Il tuo evento compare nel calendario, con le date già occupate.',
    destinazione: (dati) => {
      const e = ultimoEventoUtente(dati);
      return e && e.data ? `#/calendario?mese=${String(e.data).slice(0, 7)}` : '#/calendario';
    },
  },
  {
    id: 'spesa',
    titolo: 'Segna una spesa e guarda il margine',
    spiegazione: 'Aggiungi un costo e controlla subito quanto ti resta.',
    destinazione: () => '#/finanze',
  },
  {
    id: 'artista',
    titolo: 'Guardalo come lo vede l\'artista',
    spiegazione: 'Cambia ruolo e guarda solo ciò che riguarda un artista.',
    destinazione: () => 'ruolo:artista',
  },
];

export function segnaPasso(dati, id) {
  if (!PASSI.some((p) => p.id === id)) return 'gia';
  const g = dati.guida;
  if (g.fatti.includes(id)) return 'gia';
  g.fatti.push(id);
  if (!g.finita && PASSI.every((p) => g.fatti.includes(p.id))) {
    g.finita = true;
    return 'finita';
  }
  return 'nuovo';
}

export function avanzamento(dati) {
  const fatti = PASSI.filter((p) => dati.guida.fatti.includes(p.id)).length;
  return { fatti, totale: PASSI.length };
}

export function prossimoPasso(dati) {
  return PASSI.find((p) => !dati.guida.fatti.includes(p.id)) || null;
}
