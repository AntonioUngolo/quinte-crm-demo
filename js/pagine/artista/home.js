// Home dell'artista: incarichi da accettare, prossimi eventi, cachet dell'anno.
import { h } from '../../ui/dom.js';
import { intestazione, card, kpi, tabella, bottoneSolaLettura, statoVuoto } from '../../ui/componenti.js';
import { incarichiArtista, cachetAnno } from '../../core/aree.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';
import { euro } from '../../core/numeri.js';
import { oggiISO, formatoBreve } from '../../core/date.js';
import { colonneIncarichi } from './eventi.js';
import { persona } from '../../ui/guscio.js';

export function render(ctx) {
  const { dati } = ctx;
  const oggi = oggiISO(new Date());
  const tutti = incarichiArtista(dati, ID_ARTISTA_DEMO);
  const daAccettare = tutti.filter((i) => i.statoIncarico === 'In attesa');
  const prossimi = tutti.filter((i) => i.statoIncarico === 'Accettato' && i.data >= oggi);
  const vai = (i) => ctx.vai(`#/artista/eventi/${encodeURIComponent(i.eventoId)}`);

  const voceIncarico = (i) => h('li', { class: 'voce-elenco voce-incarico' },
    h('a', { class: 'voce-elenco-testi voce-incarico-testi', href: `#/artista/eventi/${encodeURIComponent(i.eventoId)}` },
      h('span', { class: 'voce-elenco-titolo' }, i.titolo),
      h('span', { class: 'voce-elenco-sotto' },
        [i.data ? formatoBreve(i.data) : 'Data da definire', i.momento, i.location ? i.location.nome : null].filter(Boolean).join(' · ')),
      h('span', { class: 'voce-elenco-sotto' }, `Il tuo cachet: ${euro(i.cachet)}`)),
    h('div', { class: 'azioni-riga' },
      bottoneSolaLettura('Accetta', ctx, { variante: 'primario', icona: 'check' }),
      bottoneSolaLettura('Rifiuta', ctx, { variante: 'secondario', icona: 'x' })));

  return h('div', { class: 'pagina-dashboard' },
    intestazione({ sopratitolo: 'Ciao,', titolo: persona(dati).nome, sottotitolo: 'Ecco i tuoi prossimi impegni.' }),
    h('div', { class: 'griglia-kpi griglia-kpi--tre' },
      kpi('Da accettare', String(daAccettare.length), 'incarichi in attesa di risposta', 'envelope-simple'),
      kpi('Prossimi eventi', String(prossimi.length), 'incarichi accettati in arrivo', 'calendar-check'),
      kpi('Cachet dell’anno', euro(cachetAnno(tutti, oggi)), 'incarichi accettati nei prossimi 12 mesi', 'coins')),
    card({ titolo: 'Incarichi da accettare', conteggio: daAccettare.length },
      daAccettare.length
        ? h('ul', { class: 'elenco-voci' }, daAccettare.map(voceIncarico))
        : statoVuoto('Nessun incarico da accettare in questo momento.', 'envelope-simple')),
    card({ titolo: 'Prossimi eventi', conteggio: prossimi.length, piatto: true },
      tabella(colonneIncarichi, prossimi, {
        vuoto: 'Nessun evento accettato in arrivo.', etichetta: 'Prossimi eventi', suRiga: vai,
      })));
}
