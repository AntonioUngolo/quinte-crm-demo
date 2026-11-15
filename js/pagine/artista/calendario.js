// Calendario dell'artista: i suoi eventi e le date bloccate, nelle viste Giorno · Settimana · Mese.
import { h } from '../../ui/dom.js';
import { intestazione, card, bottoneSolaLettura } from '../../ui/componenti.js';
import { calendarioConViste } from '../../ui/calendario-pagina.js';
import { vociCalendarioArtista } from '../../core/aree.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';
import { formatoBreve } from '../../core/date.js';

export function render(ctx) {
  const { dati } = ctx;
  const voci = vociCalendarioArtista(dati, ID_ARTISTA_DEMO);
  const artista = dati.artisti.find((a) => a.id === ID_ARTISTA_DEMO);
  const bloccate = [...((artista && artista.dateBloccate) || [])].sort();

  const { barra, corpo } = calendarioConViste(ctx, {
    base: '#/artista/calendario',
    voci,
    legenda: ['evento', 'assenza'],
  });

  return h('div', { class: 'pagina-calendario' },
    intestazione({ titolo: 'Calendario', sottotitolo: 'I tuoi eventi e le date in cui non sei disponibile.' }),
    barra,
    corpo,
    card({
      titolo: 'Date bloccate', conteggio: bloccate.length,
      azioni: [bottoneSolaLettura('Blocca una data', ctx, { variante: 'secondario', icona: 'calendar-x' })],
    },
    bloccate.length
      ? h('ul', { class: 'etichette-lista' }, bloccate.map((d) => h('li', { class: 'etichetta-lista' }, formatoBreve(d))))
      : h('p', { class: 'testo-vuoto' }, 'Nessuna data bloccata: risulti disponibile tutti i giorni.')));
}
