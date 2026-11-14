// Finestre modali: generica, «Ti è piaciuto?», benvenuto, conferma.
// Focus intrappolato, Esc chiude la finestra in cima, focus restituito alla chiusura.
import { h, icona, nuovoId, focalizzabili, intrappolaTab } from './dom.js';
import { campo } from './componenti.js';
import { POPUP } from '../testi.js';

const pila = [];

function inCima() {
  return pila[pila.length - 1] || null;
}

document.addEventListener('keydown', (e) => {
  const f = inCima();
  if (!f) return;
  if (e.key === 'Escape') {
    if (f.chiudibile) { e.preventDefault(); e.stopPropagation(); f.chiudi(); }
    return;
  }
  intrappolaTab(e, f.finestra);
}, true);

/** true se c'è una finestra aperta (serve a cassetto e guida per non rubare l'Esc). */
export function finestraAperta() {
  return pila.length > 0;
}

function bottoneDaSpec(a, chiudi) {
  if (a instanceof Node) return a;
  const classe = ['btn', `btn-${a.variante || 'secondario'}`];
  const contenuto = [a.icona ? icona(a.icona) : null, h('span', {}, a.etichetta)];
  if (a.href) return h('a', { class: classe, href: a.href }, contenuto);
  return h('button', {
    type: a.tipo === 'submit' ? 'submit' : 'button',
    class: classe,
    'data-autofocus': a.autofocus ? '' : null,
    onClick: a.tipo === 'submit' ? null : () => (a.azione ? a.azione(chiudi) : chiudi()),
  }, contenuto);
}

/**
 * Apre una finestra modale e restituisce chiudi().
 * opzioni: {
 *   titolo, corpo: testo|nodo|array, azioni: [nodo | { etichetta, variante, href, azione(chiudi), icona, tipo:'submit', autofocus }],
 *   chiudibile = true (Esc, clic fuori, X), classe, decorazione: nodo sopra il titolo,
 *   suInvio(evento, chiudi): se presente il contenuto è un <form novalidate>,
 *   alChiudere(): chiamata una volta alla chiusura
 * }
 * Il focus va su [data-autofocus], altrimenti sul primo campo, altrimenti sulla prima azione.
 */
export function apriFinestra({
  titolo, corpo, azioni = [], chiudibile = true, classe, decorazione, suInvio, alChiudere,
} = {}) {
  const ritorno = document.activeElement;
  const idTitolo = nuovoId('finestra-titolo');
  let chiusa = false;
  let sfondo;

  const voce = { finestra: null, chiudibile, chiudi: () => {} };

  function chiudi() {
    if (chiusa) return;
    chiusa = true;
    const i = pila.indexOf(voce);
    if (i !== -1) pila.splice(i, 1);
    sfondo.remove();
    if (!pila.length) document.documentElement.classList.remove('con-finestra');
    if (ritorno && ritorno.isConnected && typeof ritorno.focus === 'function') ritorno.focus();
    else document.getElementById('contenuto')?.focus();
    if (alChiudere) alChiudere();
  }
  voce.chiudi = chiudi;

  const contenuto = [
    h('div', { class: 'finestra-testa' },
      decorazione || null,
      h('h2', { class: 'finestra-titolo', id: idTitolo }, titolo),
      chiudibile ? h('button', {
        type: 'button', class: 'btn-icona finestra-x', 'aria-label': 'Chiudi', onClick: chiudi,
      }, icona('x')) : null),
    h('div', { class: 'finestra-corpo' },
      typeof corpo === 'string' ? h('p', {}, corpo) : corpo),
    azioni.length ? h('div', { class: 'finestra-azioni' }, azioni.map((a) => bottoneDaSpec(a, chiudi))) : null,
  ];

  const interno = suInvio
    ? h('form', {
      class: 'finestra-modulo',
      novalidate: true,
      onSubmit: (e) => { e.preventDefault(); suInvio(e, chiudi); },
    }, contenuto)
    : contenuto;

  const finestra = h('div', {
    class: ['finestra', classe],
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': idTitolo,
    tabindex: '-1',
  }, interno);
  voce.finestra = finestra;

  sfondo = h('div', {
    class: 'finestra-sfondo',
    onMousedown: (e) => { if (chiudibile && e.target === sfondo) chiudi(); },
  }, finestra);

  document.body.append(sfondo);
  document.documentElement.classList.add('con-finestra');
  pila.push(voce);

  const primo = finestra.querySelector('[data-autofocus]')
    || finestra.querySelector('.finestra-corpo input, .finestra-corpo select, .finestra-corpo textarea')
    || focalizzabili(finestra.querySelector('.finestra-azioni') || finestra)[0]
    || finestra;
  primo.focus();
  return chiudi;
}

function marchio(nome) {
  return h('span', { class: 'finestra-marchio', 'aria-hidden': 'true' }, icona(nome, true));
}

let chiudiProva = null;

/** Popup «Ti è piaciuto?». motivo: 'fine' | 'barra' | 'solaLettura'. Uno solo alla volta. */
export function popupProva(motivo = 'barra') {
  if (chiudiProva) return chiudiProva;
  const testo = POPUP.testi[motivo] || POPUP.testi.barra;
  chiudiProva = apriFinestra({
    titolo: POPUP.titolo,
    classe: 'finestra--prova',
    decorazione: marchio(motivo === 'solaLettura' ? 'lock-simple-open' : 'confetti'),
    corpo: h('p', {}, testo),
    azioni: [
      { etichetta: 'Richiedi la tua prova gratuita', variante: 'primario', href: POPUP.link.prova },
      { etichetta: 'Acquista', variante: 'secondario', href: POPUP.link.acquista },
      { etichetta: 'Continua a esplorare', variante: 'terziario', autofocus: motivo === 'solaLettura' },
    ],
    alChiudere: () => { chiudiProva = null; },
  });
  return chiudiProva;
}

/** Benvenuto alla prima visita. Risolve con il nome scritto (anche vuoto). */
export function finestraBenvenuto() {
  return new Promise((risolvi) => {
    let valore = '';
    apriFinestra({
      titolo: 'Benvenuto nella demo di Quinte CRM',
      classe: 'finestra--benvenuto',
      decorazione: marchio('calendar-star'),
      corpo: [
        h('p', {}, 'Un gestionale vero, con dati di esempio: crea un evento, componi il cast, segna le spese e guarda l\'app con gli occhi di un artista.'),
        h('p', { class: 'finestra-nota' }, 'Quello che fai resta solo su questo dispositivo e si cancella dopo 7 giorni.'),
        campo({
          etichetta: 'Come si chiama la tua agenzia?',
          nome: 'agenzia',
          segnaposto: 'La tua agenzia',
          aiuto: 'Facoltativo: lo vedrai in cima al menu.',
          attributi: { maxlength: '40', autocomplete: 'organization' },
        }),
      ],
      azioni: [{ etichetta: 'Entra nella demo', variante: 'primario', tipo: 'submit', icona: 'arrow-right' }],
      suInvio: (e, chiudi) => {
        valore = e.currentTarget.elements.agenzia.value || '';
        chiudi();
      },
      alChiudere: () => risolvi(valore),
    });
  });
}

/**
 * Finestra di conferma. Risolve true con «Conferma», false con «Annulla», Esc o clic fuori.
 * opzioni: { titolo, conferma: etichetta, annulla: etichetta, pericolo: Boolean }
 */
export function conferma(testo, { titolo = 'Sei sicuro?', conferma: siEtichetta = 'Conferma', annulla = 'Annulla', pericolo = false } = {}) {
  return new Promise((risolvi) => {
    let esito = false;
    apriFinestra({
      titolo,
      classe: 'finestra--conferma',
      corpo: testo,
      azioni: [
        { etichetta: annulla, variante: 'secondario', autofocus: true },
        {
          etichetta: siEtichetta,
          variante: pericolo ? 'pericolo' : 'primario',
          azione: (chiudi) => { esito = true; chiudi(); },
        },
      ],
      alChiudere: () => risolvi(esito),
    });
  });
}
