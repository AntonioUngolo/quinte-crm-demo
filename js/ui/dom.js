// Piccoli helper DOM. Il testo entra sempre come nodo di testo, mai come HTML.

const PROPRIETA = new Set(['value', 'checked', 'selected', 'disabled', 'indeterminate']);

function eAttributi(x) {
  return x !== null && typeof x === 'object' && !(x instanceof Node) && !Array.isArray(x);
}

function aggiungiFigli(el, figli) {
  for (const f of figli) {
    if (f === null || f === undefined || f === false || f === true) continue;
    if (Array.isArray(f)) aggiungiFigli(el, f);
    else if (f instanceof Node) el.append(f);
    else el.append(document.createTextNode(String(f)));
  }
}

/**
 * h('button', { class: 'btn', onClick: fn, 'aria-label': 'Chiudi' }, 'Testo', nodo, [altri])
 * - attrs facoltativo; stringhe e numeri diventano nodi di testo; null/false si saltano.
 * - `on<Evento>` diventa listener; `class` accetta stringa o array; `style` stringa o oggetto.
 * - value/checked/selected/disabled si impostano come proprietà (dopo i figli, così <select> funziona).
 */
export function h(tag, attrs, ...figli) {
  const el = document.createElement(tag);
  if (!eAttributi(attrs)) {
    figli.unshift(attrs);
    attrs = {};
  }
  const proprieta = [];
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'class') {
      const c = Array.isArray(v) ? v.filter(Boolean).join(' ') : String(v);
      if (c) el.className = c;
    } else if (k === 'style' && typeof v === 'object') {
      for (const [p, val] of Object.entries(v)) el.style.setProperty(p, val);
    } else if (PROPRIETA.has(k)) {
      proprieta.push([k, v]);
    } else {
      el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  aggiungiFigli(el, figli);
  for (const [k, v] of proprieta) {
    el[k] = v;
    if (k !== 'value' && v === true) el.setAttribute(k, '');
  }
  return el;
}

export function svuota(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/** Icona Phosphor: <i class="ph ph-nome"> (o ph-fill), nascosta ai lettori di schermo. */
export function icona(nome, fill = false) {
  return h('i', { class: `${fill ? 'ph-fill' : 'ph'} ph-${nome}`, 'aria-hidden': 'true' });
}

let contatore = 0;
/** Id univoco per collegare etichette, descrizioni e titoli. */
export function nuovoId(prefisso = 'id') {
  contatore += 1;
  return `${prefisso}-${contatore}`;
}

/** Elementi che possono ricevere il focus dentro `radice`, in ordine. */
export function focalizzabili(radice) {
  const sel = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return [...radice.querySelectorAll(sel)].filter((el) => el.getClientRects().length > 0);
}

/** Tab e Maiusc+Tab restano dentro `radice`. Da usare in un listener keydown. */
export function intrappolaTab(evento, radice) {
  if (evento.key !== 'Tab') return;
  const lista = focalizzabili(radice);
  if (!lista.length) { evento.preventDefault(); return; }
  const primo = lista[0];
  const ultimo = lista[lista.length - 1];
  if (!radice.contains(document.activeElement)) {
    evento.preventDefault();
    (evento.shiftKey ? ultimo : primo).focus();
  } else if (evento.shiftKey && document.activeElement === primo) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primo.focus();
  }
}
