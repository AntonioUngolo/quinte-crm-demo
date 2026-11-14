// Archivio eventi: completati, sospesi, cancellati. Lo stato arriva dall'indirizzo.
import { h } from '../../ui/dom.js';
import { intestazione, card, bottoneSolaLettura } from '../../ui/componenti.js';
import { titoloPagina } from '../../testi.js';
import { tabellaEventi, STATI_ARCHIVIO } from './eventi.js';

const STATO_DA_PARAMETRO = { completati: 'Completato', sospesi: 'Sospeso', cancellati: 'Cancellato' };
const VUOTO = {
  Completato: 'Nessun evento completato per ora.',
  Sospeso: 'Nessun evento sospeso.',
  Cancellato: 'Nessun evento cancellato.',
};
const SOTTOTITOLO = {
  Completato: 'Gli eventi già svolti, sempre consultabili.',
  Sospeso: 'Eventi in pausa, in attesa di una data o di una conferma.',
  Cancellato: 'Eventi annullati. Nella versione completa si possono ripristinare.',
};

export function render(ctx) {
  const stato = STATO_DA_PARAMETRO[ctx.params.stato];
  if (!stato || !STATI_ARCHIVIO.includes(stato)) {
    return h('div', {},
      intestazione({ titolo: 'Archivio eventi' }),
      card(null, h('p', { class: 'testo-vuoto' }, 'Questo archivio non esiste.'),
        h('p', {}, h('a', { class: 'link-testo', href: '#/eventi' }, 'Vai agli eventi'))));
  }
  const eventi = ctx.dati.eventi.filter((e) => e.stato === stato)
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  const azioni = stato === 'Completato' ? [] : [
    bottoneSolaLettura(stato === 'Sospeso' ? 'Riattiva evento' : 'Ripristina evento', ctx,
      { variante: 'secondario', icona: stato === 'Sospeso' ? 'play-circle' : 'arrow-counter-clockwise' }),
  ];
  return h('div', { class: 'pagina-eventi' },
    intestazione({ titolo: titoloPagina('archivio', ctx.params), sottotitolo: SOTTOTITOLO[stato], azioni }),
    card({ titolo: 'Elenco eventi', conteggio: eventi.length, piatto: true },
      tabellaEventi(ctx, eventi, { vuoto: VUOTO[stato] })));
}
