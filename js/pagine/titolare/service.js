// Service: elenco in sola lettura con referente e telefono.
import { h } from '../../ui/dom.js';
import { intestazione, card, tabella, bottoneSolaLettura } from '../../ui/componenti.js';

export function render(ctx) {
  const { dati } = ctx;
  const usati = (s) => dati.eventi.filter((e) => e.allestimento && e.allestimento.serviceId === s.id).length;
  const colonne = [
    { titolo: 'Service', valore: (s) => h('span', { class: 'cella-evento-titolo' }, s.nome) },
    { titolo: 'Referente', valore: (s) => s.referente || 'Non indicato' },
    { titolo: 'Telefono', valore: (s) => s.telefono || 'Non indicato' },
    { titolo: 'Eventi', valore: (s) => String(usati(s)), allinea: 'destra' },
    { titolo: 'Azioni', valore: () => h('div', { class: 'azioni-riga' },
      bottoneSolaLettura('Modifica', ctx, { variante: 'terziario', icona: 'pencil-simple' })) },
  ];
  return h('div', { class: 'pagina-anagrafica' },
    intestazione({
      titolo: 'Service',
      sottotitolo: 'Chi si occupa di palco, impianto audio e luci.',
      azioni: [bottoneSolaLettura('Nuovo service', ctx, { variante: 'primario', icona: 'plus' })],
    }),
    card({ titolo: 'Elenco service', conteggio: dati.service.length, piatto: true },
      tabella(colonne, dati.service, { vuoto: 'Nessun service in elenco.', etichetta: 'Elenco service' })));
}
