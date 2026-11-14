// Dashboard del titolare: KPI, prossimi eventi, appuntamenti, da richiamare.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, kpi, bottoneSolaLettura, statoVuoto } from '../../ui/componenti.js';
import { nomeAgenzia } from '../../ui/guscio.js';
import { kpiDashboard } from '../../core/calcoli.js';
import { euro } from '../../core/numeri.js';
import { oggiISO, formatoLungo, formatoBreve } from '../../core/date.js';
import { registraReset } from '../../ui/reset.js';
import { eventiAttivi, tabellaEventi, STATI_DA_CONFERMARE } from './eventi.js';

const FILTRI = [
  ['tutti', 'Tutti', () => true],
  ['confermati', 'Confermati', (e) => e.stato === 'Confermato'],
  ['da-confermare', 'Da confermare', (e) => STATI_DA_CONFERMARE.includes(e.stato)],
];
let filtroCorrente = 'tutti';
registraReset(() => { filtroCorrente = 'tutti'; });

export function render(ctx) {
  const { dati } = ctx;
  const oggi = oggiISO(new Date());
  const k = kpiDashboard(dati, oggi);
  const futuri = eventiAttivi(dati).filter((e) => e.data && e.data >= oggi);

  // Prossimi eventi con filtro (si ridisegna solo questa zona).
  const zonaEventi = h('div');
  const zonaChip = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtra i prossimi eventi' });
  function disegnaEventi() {
    const [, , test] = FILTRI.find(([id]) => id === filtroCorrente);
    zonaChip.replaceChildren(...FILTRI.map(([id, etichetta, t]) => h('button', {
      type: 'button', class: ['chip', filtroCorrente === id ? 'chip--attivo' : null],
      'aria-pressed': filtroCorrente === id ? 'true' : 'false', 'data-fuoco': `dash-chip-${id}`,
      onClick: () => { filtroCorrente = id; disegnaEventi(); },
    }, etichetta, h('span', { class: 'chip-n' }, String(futuri.filter(t).length)))));
    zonaEventi.replaceChildren(tabellaEventi(ctx, futuri.filter(test).slice(0, 6), {
      vuoto: 'Nessun evento in arrivo con questo filtro.', conPax: false,
    }));
  }
  disegnaEventi();

  const appuntamenti = dati.appuntamenti
    .filter((a) => a.data >= oggi)
    .sort((a, b) => (a.data + a.ora).localeCompare(b.data + b.ora))
    .slice(0, 5);
  const daRichiamare = dati.appuntamenti.filter((a) => a.daRichiamare && !a.esito);

  const voce = (a, azione) => h('li', { class: 'voce-elenco' },
    h('div', { class: 'voce-elenco-testi' },
      h('span', { class: 'voce-elenco-titolo' }, a.titolo),
      h('span', { class: 'voce-elenco-sotto' }, [a.clienteNome, a.conChi].filter(Boolean).join(' · '))),
    azione || h('span', { class: 'voce-elenco-data' }, `${formatoBreve(a.data)} · ${a.ora}`));

  return h('div', { class: 'pagina-dashboard' },
    intestazione({
      sopratitolo: 'Benvenuto,',
      titolo: nomeAgenzia(dati),
      sottotitolo: formatoLungo(oggi),
      azioni: [h('button', { type: 'button', class: 'btn btn-primario', onClick: () => ctx.vai('#/eventi/nuovo') },
        icona('plus'), h('span', {}, 'Nuovo evento'))],
    }),
    h('div', { class: 'griglia-kpi' },
      kpi('Eventi confermati', String(k.confermati), `su ${k.totaleProgramma} in programma, nei prossimi 12 mesi`, 'calendar-check'),
      kpi('Utile stimato', euro(k.utileStimato), 'Eventi dei prossimi 12 mesi: totale meno le spese', 'chart-line-up'),
      kpi('Acconti incassati', euro(k.acconti), `su ${euro(k.totaleDaIncassare)} di totale, prossimi 12 mesi`, 'coins'),
      kpi('Artisti nel roster', String(k.artisti), 'effettivi e occasionali', 'microphone-stage')),
    card({ titolo: 'Prossimi eventi', azioni: [zonaChip], piatto: true }, zonaEventi),
    h('div', { class: 'griglia-due' },
      card({ titolo: 'Prossimi appuntamenti', conteggio: appuntamenti.length },
        appuntamenti.length
          ? h('ul', { class: 'elenco-voci' }, appuntamenti.map((a) => voce(a)))
          : statoVuoto('Nessun appuntamento in programma.', 'calendar')),
      card({ titolo: 'Da richiamare', conteggio: daRichiamare.length },
        daRichiamare.length
          ? h('ul', { class: 'elenco-voci' }, daRichiamare.map((a) => voce(a,
            bottoneSolaLettura('Telefono', ctx, { variante: 'secondario', icona: 'phone' }))))
          : statoVuoto('Nessuna persona da richiamare.', 'phone'))));
}
