// Componenti riusati dalle pagine. Tutto il testo passa da h(), quindi resta testo.
import { h, icona, nuovoId } from './dom.js';
import { testoRiquadro } from '../testi.js';

// Come UT.coloreStato dell'app (stati evento), più gli stati dell'incarico.
const COLORE_STATO = {
  Confermato: 'verde',
  Accettato: 'verde',
  'In opzione': 'arancio',
  'In trattativa': 'arancio',
  'In attesa': 'arancio',
  'Da ricontattare': 'blu',
  Sospeso: 'rosso',
  Rifiutato: 'rosso',
};

/** Badge con pallino colorato: verde, arancio, blu, rosso o grigio. */
export function badgeStato(stato) {
  const colore = COLORE_STATO[stato] || 'grigio';
  return h('span', { class: `badge badge--${colore}` },
    h('span', { class: 'badge-pallino', 'aria-hidden': 'true' }), stato || 'Senza stato');
}

/** Testata di pagina: titolo (h1), sottotitolo, azioni a destra. `sopratitolo` facoltativo. */
export function intestazione({ titolo, sottotitolo, azioni = [], sopratitolo } = {}) {
  return h('header', { class: 'intestazione' },
    h('div', { class: 'intestazione-testi' },
      sopratitolo ? h('p', { class: 'intestazione-sopra' }, sopratitolo) : null,
      h('h1', { class: 'intestazione-titolo' }, titolo),
      sottotitolo ? h('p', { class: 'intestazione-sotto' }, sottotitolo) : null),
    azioni.length ? h('div', { class: 'intestazione-azioni' }, azioni) : null);
}

/**
 * Card bianca. `titolo`: stringa, nodo, null, oppure
 * { titolo, sottotitolo, conteggio, azioni: [nodi], piatto: true (corpo senza padding, per tabelle), classe }.
 */
export function card(titolo, ...figli) {
  const o = titolo && typeof titolo === 'object' && !(titolo instanceof Node) ? titolo : { titolo };
  const testa = o.titolo
    ? h('div', { class: 'card-testa' },
      h('div', { class: 'card-testa-testi' },
        h('h2', { class: 'card-titolo' }, o.titolo,
          o.conteggio !== undefined && o.conteggio !== null
            ? h('span', { class: 'conteggio' }, String(o.conteggio)) : null),
        o.sottotitolo ? h('p', { class: 'card-sotto' }, o.sottotitolo) : null),
      o.azioni && o.azioni.length ? h('div', { class: 'card-azioni' }, o.azioni) : null)
    : null;
  return h('section', { class: ['card', o.classe] }, testa,
    h('div', { class: o.piatto ? 'card-corpo card-corpo--piatto' : 'card-corpo' }, figli));
}

function cella(colonna, riga) {
  if (typeof colonna.valore === 'function') return colonna.valore(riga);
  if (colonna.campo) return riga[colonna.campo];
  return '';
}

/**
 * Tabella su desktop, elenco di schede sotto 768 px (solo CSS, stesso DOM).
 * colonne: [{ titolo, campo?, valore?: (riga) => testo|nodo, classe?, allinea?: 'destra' }]
 * La prima colonna è il titolo della scheda su mobile.
 * opzioni: { suRiga?: (riga) => void, vuoto?: testo, etichetta?: testo per aria-label }
 */
export function tabella(colonne, righe, { suRiga, vuoto = 'Niente da mostrare.', etichetta } = {}) {
  if (!righe.length) return statoVuoto(vuoto);
  const testa = h('thead', {}, h('tr', {},
    colonne.map((c) => h('th', { scope: 'col', class: c.allinea === 'destra' ? 'a-destra' : null }, c.titolo))));
  const corpo = h('tbody', {}, righe.map((riga) => {
    const attiva = typeof suRiga === 'function';
    return h('tr', {
      class: attiva ? 'cliccabile' : null,
      tabindex: attiva ? '0' : null,
      onClick: attiva ? () => suRiga(riga) : null,
      onKeydown: attiva ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); suRiga(riga); }
      } : null,
    }, colonne.map((c, i) => h('td', {
      'data-etichetta': c.titolo,
      class: [i === 0 ? 'cella-principale' : null, c.classe, c.allinea === 'destra' ? 'a-destra' : null],
    }, cella(c, riga))));
  }));
  return h('div', { class: 'tabella-wrap' },
    h('table', { class: 'tabella', 'aria-label': etichetta || null }, testa, corpo));
}

/** Riquadro «Cosa stai vedendo»; null se la pagina non ha testo o è stato chiuso. */
export function riquadroInfo(ctx, idPagina) {
  const testo = testoRiquadro(idPagina);
  if (!testo || (ctx.dati.riquadriChiusi || []).includes(idPagina)) return null;
  const idTitolo = nuovoId('riquadro');
  return h('aside', { class: 'riquadro-info', 'aria-labelledby': idTitolo, 'data-riquadro': idPagina },
    h('span', { class: 'riquadro-icona' }, icona('info')),
    h('div', { class: 'riquadro-testi' },
      h('p', { class: 'riquadro-titolo', id: idTitolo }, 'Cosa stai vedendo'),
      h('p', { class: 'riquadro-testo' }, testo)),
    h('button', {
      type: 'button',
      class: 'btn-icona btn-icona--sm',
      'aria-label': 'Chiudi il riquadro',
      onClick: () => ctx.aggiorna((d) => {
        d.riquadriChiusi = d.riquadriChiusi || [];
        if (!d.riquadriChiusi.includes(idPagina)) d.riquadriChiusi.push(idPagina);
      }),
    }, icona('x')));
}

/**
 * Pulsante dall'aspetto normale ma disattivato: lucchetto, aria-disabled, al clic il popup.
 * opzioni: { variante: 'primario'|'secondario'|'terziario'|'link', icona: nome Phosphor, solo: true (solo icona) }
 */
export function bottoneSolaLettura(etichetta, ctx, { variante = 'secondario', icona: nomeIcona, solo = false } = {}) {
  return h('button', {
    type: 'button',
    class: ['btn', `btn-${variante}`, 'sola-lettura', solo ? 'btn-solo-icona' : null],
    'aria-disabled': 'true',
    'aria-label': solo ? `${etichetta} (nella versione completa)` : null,
    title: 'Disponibile nella versione completa',
    onClick: (e) => { e.preventDefault(); ctx.apriPopup('solaLettura'); },
  },
  nomeIcona ? icona(nomeIcona) : null,
  solo ? null : h('span', {}, etichetta),
  h('i', { class: 'ph ph-lock-simple lucchetto', 'aria-hidden': 'true' }));
}

export function statoVuoto(testo, nomeIcona = 'tray') {
  return h('div', { class: 'stato-vuoto' },
    h('span', { class: 'stato-vuoto-icona' }, icona(nomeIcona)),
    h('p', {}, testo));
}

function normalizzaOpzione(o) {
  return typeof o === 'object' && o !== null
    ? { valore: String(o.valore), etichetta: o.etichetta ?? String(o.valore), disabilitata: !!o.disabilitata }
    : { valore: String(o), etichetta: String(o), disabilitata: false };
}

/**
 * Campo di modulo con etichetta, errore sotto e collegamenti aria.
 * tipo: text|email|tel|number|date|time|select|textarea|checkbox (default text).
 * opzioni (select): stringhe o { valore, etichetta, disabilitata }; `vuota`: testo dell'opzione vuota iniziale.
 * Il controllo ha name = `nome`; si ritrova con el.querySelector('[name="..."]').
 */
export function campo({
  etichetta, nome, tipo = 'text', valore = '', opzioni = [], errore, richiesto = false,
  aiuto, segnaposto, vuota, attributi = {},
} = {}) {
  const id = nuovoId(`campo-${nome || 'x'}`);
  const idErrore = errore ? `${id}-errore` : null;
  const idAiuto = aiuto ? `${id}-aiuto` : null;
  const descritto = [idAiuto, idErrore].filter(Boolean).join(' ') || null;
  const comuni = {
    id, name: nome, required: richiesto || null,
    'aria-invalid': errore ? 'true' : null, 'aria-describedby': descritto, ...attributi,
  };

  if (tipo === 'checkbox') {
    return h('div', { class: ['campo', 'campo--spunta', errore ? 'campo--errore' : null] },
      h('label', { class: 'spunta', for: id },
        h('input', { ...comuni, type: 'checkbox', checked: !!valore }),
        h('span', {}, etichetta)),
      aiuto ? h('p', { class: 'campo-aiuto', id: idAiuto }, aiuto) : null,
      errore ? h('p', { class: 'campo-errore', id: idErrore }, errore) : null);
  }

  let controllo;
  if (tipo === 'select') {
    const lista = opzioni.map(normalizzaOpzione);
    controllo = h('select', { ...comuni, class: 'controllo', value: valore ?? '' },
      vuota !== undefined ? h('option', { value: '' }, vuota) : null,
      lista.map((o) => h('option', { value: o.valore, disabled: o.disabilitata || null }, o.etichetta)));
  } else if (tipo === 'textarea') {
    controllo = h('textarea', { ...comuni, class: 'controllo', rows: '3', placeholder: segnaposto || null, value: valore ?? '' });
  } else {
    controllo = h('input', { ...comuni, class: 'controllo', type: tipo, placeholder: segnaposto || null, value: valore ?? '' });
  }

  return h('div', { class: ['campo', errore ? 'campo--errore' : null] },
    h('label', { class: 'campo-etichetta', for: id }, etichetta,
      richiesto ? h('span', { class: 'campo-richiesto', 'aria-hidden': 'true' }, ' *') : null),
    controllo,
    aiuto ? h('p', { class: 'campo-aiuto', id: idAiuto }, aiuto) : null,
    errore ? h('p', { class: 'campo-errore', id: idErrore }, errore) : null);
}

/** Card numerica come la dashboard dell'app: icona, titolo, valore grande, nota. */
export function kpi(titolo, valore, nota, nomeIcona = 'chart-line') {
  return h('section', { class: 'card kpi' },
    h('div', { class: 'kpi-testa' },
      h('span', { class: 'kpi-icona' }, icona(nomeIcona)),
      h('h2', { class: 'kpi-titolo' }, titolo)),
    h('p', { class: 'kpi-valore' }, valore),
    nota ? h('p', { class: 'kpi-nota' }, nota) : null);
}
