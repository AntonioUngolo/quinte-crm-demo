// Appuntamenti: in arrivo, da richiamare e passati, in sola lettura.
import { h } from '../../ui/dom.js';
import { intestazione, card, tabella, bottoneSolaLettura } from '../../ui/componenti.js';
import { oggiISO, formatoBreve } from '../../core/date.js';

const quando = (p) => `${formatoBreve(p.data)} alle ${p.ora}`;
const perData = (a, b) => `${a.data}${a.ora}`.localeCompare(`${b.data}${b.ora}`);

export function render(ctx) {
  const { dati } = ctx;
  const oggi = oggiISO(new Date());
  const inArrivo = dati.appuntamenti.filter((p) => p.data >= oggi).sort(perData);
  const passati = dati.appuntamenti.filter((p) => p.data < oggi).sort((a, b) => perData(b, a));
  const daRichiamare = inArrivo.filter((p) => p.daRichiamare);

  const azione = () => h('div', { class: 'azioni-riga' },
    bottoneSolaLettura('Modifica', ctx, { variante: 'terziario', icona: 'pencil-simple' }));
  const colonne = (conEsito) => [
    {
      titolo: 'Appuntamento',
      valore: (p) => h('div', { class: 'cella-evento' },
        h('span', { class: 'cella-evento-titolo' }, p.titolo),
        h('span', { class: 'cella-evento-sotto' }, [p.tipo, p.clienteNome].filter(Boolean).join(' · '))),
    },
    { titolo: 'Quando', valore: quando },
    { titolo: 'Con chi', valore: (p) => p.conChi || 'Non indicato' },
    conEsito
      ? { titolo: 'Esito', valore: (p) => p.esito || 'Non registrato' }
      : { titolo: 'Da richiamare', valore: (p) => (p.daRichiamare ? 'Sì' : 'No') },
    { titolo: 'Azioni', valore: azione },
  ];

  return h('div', { class: 'pagina-anagrafica' },
    intestazione({
      titolo: 'Appuntamenti',
      sottotitolo: 'Sopralluoghi, telefonate e incontri con i clienti.',
      azioni: [bottoneSolaLettura('Nuovo appuntamento', ctx, { variante: 'primario', icona: 'plus' })],
    }),
    h('div', { class: 'scheda-sezione' },
      card({ titolo: 'Da richiamare', conteggio: daRichiamare.length, piatto: true },
        tabella(colonne(false), daRichiamare, { vuoto: 'Nessun cliente da richiamare.', etichetta: 'Da richiamare' })),
      card({ titolo: 'In arrivo', conteggio: inArrivo.length, piatto: true },
        tabella(colonne(false), inArrivo, { vuoto: 'Nessun appuntamento in arrivo.', etichetta: 'Appuntamenti in arrivo' })),
      card({ titolo: 'Passati', conteggio: passati.length, piatto: true },
        tabella(colonne(true), passati, { vuoto: 'Nessun appuntamento passato.', etichetta: 'Appuntamenti passati' }))));
}
