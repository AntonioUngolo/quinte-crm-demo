// Opzioni: liste dell'agenzia e schede Logo e colori, Email, Contratti, solo da guardare.
import { h } from '../../ui/dom.js';
import { registraReset } from '../../ui/reset.js';
import { intestazione, card, bottoneSolaLettura } from '../../ui/componenti.js';
import { nomeAgenzia } from '../../ui/guscio.js';

const SCHEDE = [
  { id: 'liste', etichetta: 'Liste' },
  { id: 'logo', etichetta: 'Logo e colori' },
  { id: 'email', etichetta: 'Email' },
  { id: 'contratti', etichetta: 'Contratti' },
];
const COLORI = [
  ['Arancio principale', '#C2410C'],
  ['Arancio chiaro', '#FFF3EC'],
  ['Grigio scuro', '#101828'],
  ['Grigio chiaro', '#F2F4F7'],
];
const MODELLI = [
  ['Contratto cliente', 'Il documento che il cliente firma per confermare data, prezzo e condizioni.'],
  ['Contratto artisti', 'Il documento per ogni artista del cast, con momento, cachet e dress code.'],
  ['Liberatoria SIAE', 'La liberatoria per i diritti musicali, da far firmare quando serve.'],
];

// La scheda scelta resta finché si resta nella demo (non nei dati salvati).
let scheda = 'liste';
registraReset(() => { scheda = 'liste'; });

function listaOpzioni(ctx, titolo, voci, azione) {
  return card({ titolo, conteggio: voci.length, azioni: [bottoneSolaLettura(azione, ctx, { variante: 'secondario', icona: 'plus' })] },
    h('ul', { class: 'etichette-lista' }, voci.map((v) => h('li', { class: 'etichetta-lista' }, v))));
}

function liste(ctx) {
  const o = ctx.dati.opzioni;
  return h('div', { class: 'griglia-due' },
    listaOpzioni(ctx, 'Tipi di evento', o.tipi, 'Aggiungi tipo'),
    listaOpzioni(ctx, 'Stati', o.stati, 'Aggiungi stato'),
    listaOpzioni(ctx, 'Momenti', o.momenti, 'Aggiungi momento'),
    listaOpzioni(ctx, 'Categorie di spesa', o.categorieSpese, 'Aggiungi categoria'));
}

function logo(ctx) {
  const nome = nomeAgenzia(ctx.dati);
  return h('div', { class: 'griglia-due' },
    card({ titolo: 'Logo e nome', azioni: [bottoneSolaLettura('Cambia logo', ctx, { variante: 'secondario', icona: 'image' })] },
      h('div', { class: 'opzioni-logo' },
        h('span', { class: 'opzioni-logo-quadro', 'aria-hidden': 'true' }, (nome.trim()[0] || 'Q').toUpperCase()),
        h('div', {}, h('p', { class: 'cella-evento-titolo' }, nome),
          h('p', { class: 'cella-evento-sotto' }, 'Il nome e il logo compaiono nel menu e nei documenti.')))),
    card({ titolo: 'Colori', azioni: [bottoneSolaLettura('Cambia colori', ctx, { variante: 'secondario', icona: 'palette' })] },
      h('ul', { class: 'campioni' }, COLORI.map(([n, c]) => h('li', { class: 'campione' },
        h('span', { class: 'campione-colore', style: { background: c }, 'aria-hidden': 'true' }),
        h('span', {}, n, h('span', { class: 'campione-codice' }, c)))))));
}

function email(ctx) {
  return card({ titolo: 'Email ai clienti e agli artisti', azioni: [bottoneSolaLettura('Modifica modello', ctx, { variante: 'secondario', icona: 'pencil-simple' })] },
    h('dl', { class: 'dati' },
      h('div', { class: 'dato' }, h('dt', { class: 'dato-etichetta' }, 'Mittente'), h('dd', { class: 'dato-valore' }, nomeAgenzia(ctx.dati))),
      h('div', { class: 'dato' }, h('dt', { class: 'dato-etichetta' }, 'Oggetto'), h('dd', { class: 'dato-valore' }, 'Il tuo evento: i prossimi passi')),
      h('div', { class: 'dato' }, h('dt', { class: 'dato-etichetta' }, 'Testo'),
        h('dd', { class: 'dato-valore dato-valore--testo' }, 'Ciao, ti scriviamo per confermare i dettagli dell’evento. Trovi tutto nella tua area riservata, dove puoi anche scegliere la musica. Per qualsiasi dubbio rispondi a questa email.'))));
}

function contratti(ctx) {
  return card({ titolo: 'Modelli di contratto', conteggio: MODELLI.length, azioni: [bottoneSolaLettura('Nuovo modello', ctx, { variante: 'secondario', icona: 'plus' })] },
    h('ul', { class: 'modelli' }, MODELLI.map(([n, d]) => h('li', { class: 'modello' },
      h('div', {}, h('p', { class: 'cella-evento-titolo' }, n), h('p', { class: 'cella-evento-sotto' }, d)),
      bottoneSolaLettura('Modifica', ctx, { variante: 'terziario', icona: 'pencil-simple' })))));
}

const CORPI = { liste, logo, email, contratti };

export function render(ctx) {
  const zona = h('div', { class: 'scheda-sezione', role: 'tabpanel' });
  const barra = h('div', { class: 'schede', role: 'tablist', 'aria-label': 'Sezioni delle opzioni' });

  function disegna() {
    barra.replaceChildren(...SCHEDE.map((s) => h('button', {
      type: 'button', role: 'tab', class: ['scheda-voce', scheda === s.id ? 'scheda-voce--attiva' : null],
      'aria-selected': scheda === s.id ? 'true' : 'false', 'data-fuoco': `opz-${s.id}`,
      onClick: () => { scheda = s.id; disegna(); },
    }, s.etichetta)));
    selettore.value = scheda;
    zona.replaceChildren(CORPI[scheda](ctx));
  }
  // Sotto i 768 px la barra delle schede si nasconde e al suo posto c'è il selettore (come nella scheda evento).
  const selettore = h('select', {
    id: 'sezione-opzioni', class: 'controllo', 'data-fuoco': 'opz-select', value: scheda,
    onChange: (ev) => { scheda = ev.target.value; disegna(); },
  }, SCHEDE.map((s) => h('option', { value: s.id }, s.etichetta)));
  const contenitoreSelettore = h('div', { class: 'schede-select' },
    h('label', { class: 'campo-etichetta', for: 'sezione-opzioni' }, 'Sezione'), selettore);
  disegna();

  return h('div', { class: 'pagina-anagrafica' },
    intestazione({ titolo: 'Opzioni', sottotitolo: 'Le impostazioni dell’agenzia. In questa demo si possono solo guardare.' }),
    barra, contenitoreSelettore, zona);
}
