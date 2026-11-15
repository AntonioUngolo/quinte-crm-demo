// Calendario del titolare: viste Giorno · Settimana · Mese, filtro per artista.
import { h } from '../../ui/dom.js';
import { intestazione, campo } from '../../ui/componenti.js';
import { calendarioConViste } from '../../ui/calendario-pagina.js';
import { menuAggiungi } from '../../ui/calendario-viste.js';
import { vociCalendario } from '../../core/calendario.js';

export function render(ctx) {
  const { dati, params } = ctx;
  const artista = dati.artisti.find((a) => a.id === params.artista) || null;
  const artistaId = artista ? artista.id : null;
  const voci = vociCalendario(dati, { artistaId });

  // Il filtro tiene vista e data; l'artista scelto resta sempre tra le opzioni.
  const filtro = campo({
    etichetta: 'Mostra gli eventi di', nome: 'artista', tipo: 'select', valore: artistaId || '',
    vuota: 'Tutti gli eventi',
    opzioni: [...dati.artisti].sort((a, b) => a.nome.localeCompare(b.nome))
      .map((a) => ({ valore: a.id, etichetta: a.nome })),
  });
  filtro.classList.add('cal-filtro');
  filtro.querySelector('select').addEventListener('change', (e) => {
    const q = new URLSearchParams();
    for (const k of ['vista', 'data', 'mese', 'giorno']) if (params[k]) q.set(k, params[k]);
    if (e.target.value) q.set('artista', e.target.value);
    ctx.vai(`#/calendario${q.toString() ? `?${q}` : ''}`);
  });

  const { barra, corpo, giorni } = calendarioConViste(ctx, {
    base: '#/calendario',
    query: { artista: artistaId },
    voci,
    legenda: artistaId ? ['evento'] : undefined,
    nota: artistaId ? h('p', { class: 'cal-nota' }, `Stai vedendo solo gli eventi in cui lavora ${artista.nome}.`) : null,
    filtro,
    suVuoto: (giorno, minuto) => menuAggiungi(ctx, giorno, minuto),
  });

  // Passo della guida: il proprio evento si vede nel periodo mostrato.
  if (voci.some((v) => v.tipo === 'evento' && v.daUtente && giorni.includes(v.data))) {
    ctx.segnaPasso('calendario');
  }

  return h('div', { class: 'pagina-calendario' },
    intestazione({ titolo: 'Calendario', sottotitolo: 'Eventi, appuntamenti e impegni per giorno, settimana o mese.' }),
    barra,
    corpo);
}
