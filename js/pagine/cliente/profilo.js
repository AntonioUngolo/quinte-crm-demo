// Profilo del cliente: i suoi contatti, in sola lettura.
import { h } from '../../ui/dom.js';
import { intestazione, card, bottoneSolaLettura } from '../../ui/componenti.js';
import { ID_CLIENTE_DEMO } from '../../core/seed.js';
import { riga } from '../area-comune.js';

export function render(ctx) {
  const c = ctx.dati.clienti.find((x) => x.id === ID_CLIENTE_DEMO);
  if (!c) return h('div', {}, intestazione({ titolo: 'Profilo' }));
  return h('div', { class: 'pagina-anagrafica' },
    intestazione({
      titolo: 'Profilo', sottotitolo: c.nome,
      azioni: [bottoneSolaLettura('Modifica profilo', ctx, { variante: 'secondario', icona: 'pencil-simple' })],
    }),
    card('I vostri contatti', h('dl', { class: 'dati' },
      riga('Nome', c.nome),
      riga('Telefono', c.telefono),
      riga('Email', c.email))));
}
