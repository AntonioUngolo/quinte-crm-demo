// Guida «Prova in 5 minuti»: pannello a destra (≥ 1200 px), sovrapposto (tra 768 e 1200 px),
// barretta in basso con foglio che sale (< 768 px). Stato in dati.guida.
import { h, icona, intrappolaTab, focalizzabili } from './dom.js';
import { PASSI, avanzamento, prossimoPasso } from '../core/guida.js';
import { finestraAperta } from './popup.js';

const MOBILE = '(max-width: 767.98px)';
let foglioAperto = false; // stato solo visivo, sopravvive ai ridisegni
let focusAlFoglio = false; // dopo «Apri la guida» su mobile il focus entra nel foglio

function suMobile() {
  return typeof window.matchMedia === 'function' && window.matchMedia(MOBILE).matches;
}

/**
 * ctx: { dati, aggiorna(fn), vai(hash), cambiaRuolo(ruolo, hash?), apriPopup(motivo) }
 * Restituisce un DocumentFragment da mettere nella zona guida del guscio.
 */
export function disegnaGuida(ctx) {
  const { dati } = ctx;
  const g = dati.guida;
  const { fatti, totale } = avanzamento(dati);
  const prossimo = prossimoPasso(dati);
  const frammento = document.createDocumentFragment();

  if (!g.aperta) {
    foglioAperto = false;
    frammento.append(h('button', {
      type: 'button',
      class: 'guida-apri',
      'data-fuoco': 'guida-apri',
      onClick: () => {
        foglioAperto = suMobile();
        focusAlFoglio = foglioAperto;
        ctx.aggiorna((d) => { d.guida.aperta = true; });
      },
    }, icona('signpost'), h('span', {}, 'Apri la guida'),
    h('span', { class: 'guida-apri-conto' }, g.finita ? 'fatta' : `${fatti} di ${totale}`)));
    return frammento;
  }

  function portami(passo) {
    const dest = passo.destinazione(dati);
    foglioAperto = false;
    document.documentElement.classList.remove('con-foglio');
    if (dest.startsWith('ruolo:')) ctx.cambiaRuolo(dest.slice('ruolo:'.length));
    else if (dati.ruolo !== 'titolare') ctx.cambiaRuolo('titolare', dest);
    else ctx.vai(dest);
  }

  function chiudiGuida() {
    foglioAperto = false;
    document.documentElement.classList.remove('con-foglio');
    ctx.aggiorna((d) => { d.guida.aperta = false; });
  }

  const passi = h('ol', { class: 'guida-passi' }, PASSI.map((p, i) => {
    const fatto = g.fatti.includes(p.id);
    const corrente = !fatto && prossimo && prossimo.id === p.id;
    return h('li', { class: ['passo', fatto ? 'passo--fatto' : null, corrente ? 'passo--corrente' : null] },
      h('span', { class: 'passo-segno', 'aria-hidden': 'true' }, fatto ? icona('check', false) : String(i + 1)),
      h('div', { class: 'passo-testi' },
        h('h3', { class: 'passo-titolo' },
          h('span', { class: 'sr' }, fatto ? 'Fatto: ' : `Passo ${i + 1}: `), p.titolo),
        h('p', { class: 'passo-spiegazione' }, p.spiegazione),
        fatto ? null : h('button', {
          type: 'button',
          class: corrente ? 'btn btn-primario btn-sm' : 'btn btn-link btn-sm',
          'data-fuoco': `portami-${p.id}`,
          onClick: () => portami(p),
        }, h('span', {}, 'Portami lì'), icona('arrow-right'))));
  }));

  const fine = g.finita ? h('div', { class: 'guida-fine' },
    h('span', { class: 'guida-fine-icona', 'aria-hidden': 'true' }, icona('confetti', true)),
    h('p', { class: 'guida-fine-titolo' }, 'Giro completo!'),
    h('p', { class: 'guida-fine-testo' }, 'Hai visto come lavora un\'agenzia con Quinte CRM. Ora puoi provarlo con i tuoi eventi e il tuo cast.'),
    h('button', {
      type: 'button', class: 'btn btn-primario btn-blocco', 'data-fuoco': 'guida-prova',
      onClick: () => ctx.apriPopup('fine'),
    }, h('span', {}, 'Richiedi la tua prova gratuita'))) : null;

  const percentuale = Math.round((fatti / totale) * 100);
  const progresso = (classe) => h('div', {
    class: ['progresso', classe],
    role: 'progressbar',
    'aria-label': 'Avanzamento della guida',
    'aria-valuemin': '0',
    'aria-valuemax': String(totale),
    'aria-valuenow': String(fatti),
    'aria-valuetext': `${fatti} di ${totale} passi`,
  }, h('span', { class: 'progresso-pieno', style: { width: `${percentuale}%` } }));

  const mobile = suMobile();
  const pannello = h('aside', {
    class: 'guida',
    id: 'guida',
    'aria-labelledby': 'guida-titolo',
    onKeydown: (e) => {
      if (!suMobile() || !foglioAperto || finestraAperta()) return;
      if (e.key === 'Escape') { e.preventDefault(); chiudiFoglio(); return; }
      intrappolaTab(e, pannello);
    },
  },
  h('div', { class: 'guida-testa' },
    h('div', {},
      h('p', { class: 'guida-sopra' }, 'Percorso guidato'),
      h('h2', { class: 'guida-titolo', id: 'guida-titolo' }, 'Prova in 5 minuti')),
    h('button', {
      type: 'button',
      class: 'btn-icona',
      'data-fuoco': 'guida-x',
      'aria-label': mobile ? 'Riduci la guida' : 'Chiudi la guida',
      onClick: () => (suMobile() ? chiudiFoglio() : chiudiGuida()),
    }, icona(mobile ? 'caret-down' : 'x'))),
  h('div', { class: 'guida-avanzamento' },
    h('p', {}, g.finita ? 'Tutti i passi fatti' : `${fatti} di ${totale} passi fatti`),
    progresso()),
  fine,
  passi,
  h('div', { class: 'guida-piede' },
    h('button', {
      type: 'button', class: 'btn btn-terziario btn-sm', 'data-fuoco': 'guida-chiudi',
      onClick: chiudiGuida,
    }, icona('eye-slash'), h('span', {}, 'Chiudi la guida'))));

  const barretta = h('button', {
    type: 'button',
    class: 'guida-barretta',
    'aria-controls': 'guida',
    'aria-expanded': 'false',
    'data-fuoco': 'guida-barretta',
    onClick: () => apriFoglio(),
  },
  h('span', { class: 'guida-barretta-icona', 'aria-hidden': 'true' }, icona('signpost', true)),
  h('span', { class: 'guida-barretta-testi' },
    h('span', { class: 'guida-barretta-titolo' },
      g.finita ? 'Prova in 5 minuti · completata' : `Prova in 5 minuti · ${fatti} di ${totale}`),
    progresso('progresso--mini')),
  icona('caret-up'));

  const sfondo = h('div', { class: 'guida-sfondo', onClick: () => chiudiFoglio() });

  function apriFoglio(spostaFocus = true) {
    foglioAperto = true;
    pannello.classList.add('guida--foglio');
    sfondo.classList.add('visibile');
    pannello.setAttribute('role', 'dialog');
    pannello.setAttribute('aria-modal', 'true');
    barretta.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('con-foglio');
    // Dopo il ridisegno in corso (e il suo ripristino del focus), quando il pannello è nel DOM.
    if (spostaFocus) queueMicrotask(() => focalizzabili(pannello)[0]?.focus());
  }

  function chiudiFoglio() {
    foglioAperto = false;
    pannello.classList.remove('guida--foglio');
    sfondo.classList.remove('visibile');
    pannello.removeAttribute('role');
    pannello.removeAttribute('aria-modal');
    barretta.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('con-foglio');
    barretta.focus();
  }

  if (foglioAperto && mobile) apriFoglio(focusAlFoglio);
  else document.documentElement.classList.remove('con-foglio');
  focusAlFoglio = false;

  frammento.append(pannello, sfondo, barretta);
  return frammento;
}
