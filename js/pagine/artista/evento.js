// L'incarico visto dall'artista: solo il suo cachet, momento, dress code, luogo e orario.
import { h } from '../../ui/dom.js';
import { intestazione, card, badgeStato, bottoneSolaLettura } from '../../ui/componenti.js';
import { incaricoArtista } from '../../core/aree.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';
import { euro } from '../../core/numeri.js';
import { formatoLungo } from '../../core/date.js';
import { riga, giorniMancanti, nonTrovato, indirizzo } from '../area-comune.js';

export function render(ctx) {
  const i = incaricoArtista(ctx.dati, ID_ARTISTA_DEMO, ctx.params.id);
  if (!i) {
    return nonTrovato(ctx, {
      titolo: 'Incarico non trovato',
      testo: 'Questo evento non esiste o non è tra i tuoi incarichi. Torna all’elenco per vedere i tuoi eventi.',
      hash: '#/artista/eventi', etichetta: 'Torna ai miei eventi',
    });
  }
  const cerimonia = i.tipo === 'Matrimonio' || i.tipo === 'Cerimonia';
  const azioni = i.statoIncarico === 'In attesa'
    ? [bottoneSolaLettura('Accetta', ctx, { variante: 'primario', icona: 'check' }),
      bottoneSolaLettura('Rifiuta', ctx, { variante: 'secondario', icona: 'x' })]
    : [];
  return h('div', { class: 'pagina-scheda' },
    h('p', { class: 'indietro' }, h('a', { class: 'link-testo', href: '#/artista/eventi' }, 'Tutti i miei eventi')),
    intestazione({
      titolo: i.titolo,
      sottotitolo: [i.data ? formatoLungo(i.data) : 'Data da definire', i.location ? i.location.nome : null].filter(Boolean).join(' · '),
      azioni,
    }),
    h('div', { class: 'scheda-meta' }, badgeStato(i.statoIncarico)),
    h('div', { class: 'scheda-sezione' },
      h('div', { class: 'griglia-due' },
        card('Il tuo incarico', h('dl', { class: 'dati' },
          riga('Momento', i.momento),
          riga('Il tuo cachet', euro(i.cachet)),
          riga('Dress code', i.dressCode),
          riga('Risposta', badgeStato(i.statoIncarico)))),
        card('Quando e dove', h('dl', { class: 'dati' },
          riga('Data', i.data ? formatoLungo(i.data) : ''),
          riga('Giorni mancanti', giorniMancanti(i.data)),
          riga('Fascia', i.fascia || ''),
          riga('Tipo di evento', i.tipo),
          riga('Location', i.location ? i.location.nome : ''),
          riga('Indirizzo', i.location ? indirizzo(i.location) : ''),
          cerimonia ? riga('Rito', i.rito) : null,
          cerimonia && i.rito === 'Religioso' ? riga('Chiesa', i.chiesa ? `${i.chiesa.nome}, ${i.chiesa.citta}` : '') : null,
          cerimonia && i.rito === 'Religioso' && i.chiesa ? riga('Indirizzo chiesa', i.chiesa.indirizzo) : null),
        i.location ? h('div', { class: 'dato-azione' }, bottoneSolaLettura('Apri in Maps', ctx, { variante: 'link', icona: 'map-pin' })) : null))));
}
