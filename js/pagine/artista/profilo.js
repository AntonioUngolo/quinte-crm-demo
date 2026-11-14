// Profilo dell'artista: i suoi dati, in sola lettura.
import { h } from '../../ui/dom.js';
import { intestazione, card, bottoneSolaLettura } from '../../ui/componenti.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';
import { riga } from '../area-comune.js';

export function render(ctx) {
  const a = ctx.dati.artisti.find((x) => x.id === ID_ARTISTA_DEMO);
  if (!a) return h('div', {}, intestazione({ titolo: 'Profilo' }));
  return h('div', { class: 'pagina-anagrafica' },
    intestazione({
      titolo: 'Profilo', sottotitolo: `${a.ruolo} · ${a.tipo}`,
      azioni: [bottoneSolaLettura('Modifica profilo', ctx, { variante: 'secondario', icona: 'pencil-simple' })],
    }),
    h('div', { class: 'scheda-sezione' },
      h('div', { class: 'griglia-due' },
        card('I tuoi dati', h('dl', { class: 'dati' },
          riga('Nome', a.nome),
          riga('Ruolo', a.ruolo),
          riga('Tipo', a.tipo),
          riga('Telefono', a.telefono),
          riga('Email', a.email))),
        card('Momenti', h('dl', { class: 'dati' },
          riga('Momenti coperti', (a.momenti || []).join(', ')))))));
}
