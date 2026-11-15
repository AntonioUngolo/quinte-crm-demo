// Guscio: barra demo in alto, menu per ruolo (cassetto sotto 768 px), area della pagina.
import { h, icona, intrappolaTab, focalizzabili } from './dom.js';
import { oggiISO, formatoBreve } from '../core/date.js';
import { finestraAperta } from './popup.js';

// Voci e ordine come app/lib/components/nav_menu_widget.dart (Utenti e «Vedi come…» esclusi).
const VOCI = {
  titolare: [
    { etichetta: 'Dashboard', icona: 'squares-four', hash: '#/', pagine: ['dashboard'] },
    {
      etichetta: 'Eventi', icona: 'music-notes', hash: '#/eventi',
      pagine: ['eventi', 'evento-nuovo', 'evento-scheda', 'evento-modifica', 'evento-chat'],
      sotto: [
        { etichetta: 'Eventi completati', icona: 'calendar-check', hash: '#/archivio/completati', stato: 'completati' },
        { etichetta: 'Eventi cancellati', icona: 'trash', hash: '#/archivio/cancellati', stato: 'cancellati' },
        { etichetta: 'Eventi sospesi', icona: 'pause-circle', hash: '#/archivio/sospesi', stato: 'sospesi' },
      ],
    },
    { etichetta: 'Calendario', icona: 'calendar-blank', hash: '#/calendario', pagine: ['calendario'] },
    { etichetta: 'Artisti', icona: 'users-three', hash: '#/artisti', pagine: ['artisti', 'artista-scheda'] },
    { etichetta: 'Location', icona: 'map-pin', hash: '#/location', pagine: ['location'] },
    { etichetta: 'Chiese', icona: 'church', hash: '#/chiese', pagine: ['chiese'] },
    { etichetta: 'Clienti', icona: 'user', hash: '#/clienti', pagine: ['clienti', 'cliente-scheda'] },
    { etichetta: 'Appuntamenti', icona: 'notebook', hash: '#/appuntamenti', pagine: ['appuntamenti'] },
    { etichetta: 'Service', icona: 'wrench', hash: '#/service', pagine: ['service'] },
    { etichetta: 'Finanze & Spese', icona: 'chart-bar', hash: '#/finanze', pagine: ['finanze'] },
    { etichetta: 'Opzioni', icona: 'sliders-horizontal', hash: '#/opzioni', pagine: ['opzioni'] },
  ],
  artista: [
    { etichetta: 'Dashboard', icona: 'squares-four', hash: '#/artista', pagine: ['artista-home'] },
    { etichetta: 'I miei eventi', icona: 'music-notes', hash: '#/artista/eventi', pagine: ['artista-eventi', 'artista-evento'] },
    { etichetta: 'Calendario', icona: 'calendar-blank', hash: '#/artista/calendario', pagine: ['artista-calendario'] },
    { etichetta: 'Location', icona: 'map-pin', hash: '#/artista/location', pagine: ['artista-location'] },
    { etichetta: 'Chiese', icona: 'church', hash: '#/artista/chiese', pagine: ['artista-chiese'] },
    { etichetta: 'Profilo', icona: 'user-circle', hash: '#/artista/profilo', pagine: ['artista-profilo'] },
  ],
  cliente: [
    { etichetta: 'I miei eventi', icona: 'music-notes', hash: '#/cliente', pagine: ['cliente-home', 'cliente-evento'] },
    { etichetta: 'Profilo', icona: 'user-circle', hash: '#/cliente/profilo', pagine: ['cliente-profilo'] },
  ],
};

export const RUOLI = [
  { valore: 'titolare', etichetta: 'Titolare' },
  { valore: 'artista', etichetta: 'Artista' },
  { valore: 'cliente', etichetta: 'Cliente' },
];

export const HOME_RUOLO = { titolare: '#/', artista: '#/artista', cliente: '#/cliente' };

export function nomeAgenzia(dati) {
  return (dati.agenzia || '').trim() || 'La tua agenzia';
}

function iniziale(testo) {
  const primo = Array.from(String(testo).trim())[0] || 'Q';
  return primo.toLocaleUpperCase('it-IT');
}

function iniziali(nome) {
  const parole = String(nome).split(/\s+/).filter((p) => /^\p{L}/u.test(p));
  return parole.slice(0, 2).map((p) => iniziale(p)).join('') || iniziale(nome);
}

/** Chi stai guardando: nome e ruolo leggibile. */
export function persona(dati) {
  if (dati.ruolo === 'artista') {
    const a = (dati.artisti || []).find((x) => x.demo);
    return { nome: a ? a.nome : 'Artista della demo', ruolo: a ? `Artista, ${a.ruolo.toLowerCase()}` : 'Artista' };
  }
  if (dati.ruolo === 'cliente') {
    const c = (dati.clienti || []).find((x) => x.demo);
    return { nome: c ? c.nome : 'Cliente della demo', ruolo: 'Cliente' };
  }
  return { nome: 'Titolare', ruolo: nomeAgenzia(dati) };
}

function logo(dati) {
  const nome = nomeAgenzia(dati);
  return h('div', { class: 'marchio' },
    h('span', { class: 'marchio-logo', 'aria-hidden': 'true' }, iniziale(nome)),
    h('span', { class: 'marchio-nome' }, nome));
}

function voceMenu(v, attiva, sotto = false) {
  return h('li', {},
    h('a', {
      href: v.hash,
      class: ['menu-voce', sotto ? 'menu-voce--sotto' : null, attiva ? 'attiva' : null],
      'aria-current': attiva ? 'page' : null,
    }, icona(v.icona, attiva), h('span', {}, v.etichetta)));
}

function vociMenu(ctx) {
  const voci = VOCI[ctx.dati.ruolo] || VOCI.titolare;
  const elementi = [];
  for (const v of voci) {
    elementi.push(voceMenu(v, v.pagine.includes(ctx.pagina)));
    for (const s of v.sotto || []) {
      const attiva = ctx.pagina === 'archivio' && ctx.params && ctx.params.stato === s.stato;
      elementi.push(voceMenu(s, attiva, true));
    }
  }
  return h('ul', { class: 'menu-voci' }, elementi);
}

function barraDemo(ctx) {
  const { dati } = ctx;
  const scade = formatoBreve(oggiISO(new Date(dati.scadenza)));
  const titolare = dati.ruolo === 'titolare';
  const chi = persona(dati);

  const selettore = h('select', {
    class: 'barra-select',
    id: 'vedi-come',
    'data-fuoco': 'vedi-come',
    value: dati.ruolo,
    onChange: (e) => ctx.cambiaRuolo(e.target.value),
  }, RUOLI.map((r) => h('option', { value: r.valore }, r.etichetta)));

  return h('div', { class: 'barra-demo', role: 'region', 'aria-label': 'Barra della demo' },
    h('div', { class: 'barra-info' },
      h('span', { class: 'barra-pill' }, 'Demo'),
      h('p', { class: 'barra-testo' },
        h('span', { class: 'solo-largo' }, 'I dati restano solo su questo dispositivo e si cancellano il '),
        h('span', { class: 'solo-stretto' }, 'Si cancella il '),
        h('strong', {}, scade)),
      titolare ? null : h('p', { class: 'barra-vista' },
        icona('eye'), h('span', { class: 'barra-come' }, 'Come'), h('span', { class: 'barra-stai' }, 'Stai guardando come '), h('strong', {}, chi.nome),
          h('span', { class: 'barra-ruolo' }, `(${(RUOLI.find((r) => r.valore === dati.ruolo) || {}).etichetta})`))),
    h('div', { class: 'barra-azioni' },
      h('div', { class: 'barra-vedi' },
        h('label', { for: 'vedi-come' }, 'Vedi come'), selettore),
      titolare ? null : h('button', {
        type: 'button', class: 'barra-btn', 'aria-label': 'Torna al titolare', 'data-fuoco': 'torna-titolare',
        onClick: () => ctx.cambiaRuolo('titolare'),
      }, icona('arrow-u-up-left'), h('span', { class: 'solo-largo-btn' }, 'Torna al titolare')),
      h('button', {
        type: 'button', class: 'barra-btn', 'aria-label': 'Ricomincia la demo', 'data-fuoco': 'ricomincia',
        onClick: () => ctx.ricomincia(),
      }, icona('arrow-counter-clockwise'), h('span', { class: 'solo-largo-btn' }, 'Ricomincia')),
      h('button', {
        type: 'button', class: 'btn btn-primario btn-sm', 'data-fuoco': 'richiedi-prova',
        onClick: () => ctx.apriPopup('barra'),
      }, h('span', {}, 'Richiedi la prova'))));
}

/**
 * Disegna barra demo, menu e area pagina.
 * ctx: { dati, pagina, params, cambiaRuolo(ruolo), ricomincia(), apriPopup(motivo) }
 * Restituisce { radice, contenuto: <main id="contenuto">, zonaGuida: contenitore della guida }.
 */
export function disegnaGuscio(ctx) {
  const { dati } = ctx;
  const chi = persona(dati);
  let radice;

  const burger = h('button', {
    type: 'button',
    class: 'btn-icona testata-burger',
    'aria-label': 'Apri il menu',
    'aria-controls': 'menu',
    'aria-expanded': 'false',
    onClick: () => apriCassetto(),
  }, icona('list'));

  const menu = h('nav', {
    class: 'menu', id: 'menu', 'aria-label': 'Menu principale',
    onKeydown: (e) => {
      if (!radice.classList.contains('menu-aperto') || finestraAperta()) return;
      if (e.key === 'Escape') { e.preventDefault(); chiudiCassetto(); return; }
      intrappolaTab(e, menu);
    },
    onClick: (e) => { if (e.target.closest('a')) chiudiCassetto(false); },
  },
  h('div', { class: 'menu-testa' },
    logo(dati),
    h('button', {
      type: 'button', class: 'btn-icona menu-chiudi', 'aria-label': 'Chiudi il menu',
      onClick: () => chiudiCassetto(),
    }, icona('x'))),
  h('div', { class: 'menu-scorre' }, vociMenu(ctx)),
  h('div', { class: 'menu-piede' },
    h('div', { class: 'utente' },
      h('span', { class: 'utente-avatar', 'aria-hidden': 'true' }, iniziali(chi.nome)),
      h('span', { class: 'utente-testi' },
        h('span', { class: 'utente-nome' }, chi.nome),
        h('span', { class: 'utente-ruolo' }, chi.ruolo))),
    h('p', { class: 'menu-prodotto' },
      h('img', { class: 'menu-prodotto-logo', src: 'img/quinte-logo.webp', alt: 'Quinte CRM', width: '63', height: '16' }),
      h('span', {}, '· Demo'))));

  const sfondo = h('div', { class: 'cassetto-sfondo', onClick: () => chiudiCassetto() });

  function apriCassetto() {
    radice.classList.add('menu-aperto');
    document.documentElement.classList.add('con-cassetto');
    burger.setAttribute('aria-expanded', 'true');
    // visibility torna visibile subito all'apertura: il focus può entrare appena finito il clic.
    queueMicrotask(() => (menu.querySelector('.menu-voce.attiva') || focalizzabili(menu)[0])?.focus());
  }

  function chiudiCassetto(restituisciFocus = true) {
    if (!radice.classList.contains('menu-aperto')) return;
    radice.classList.remove('menu-aperto');
    document.documentElement.classList.remove('con-cassetto');
    burger.setAttribute('aria-expanded', 'false');
    if (restituisciFocus) burger.focus();
  }

  const contenuto = h('main', { id: 'contenuto', class: 'pagina', tabindex: '-1' });
  const zonaGuida = h('div', { class: 'zona-guida' });

  radice = h('div', { class: ['guscio', dati.guida && dati.guida.aperta ? 'con-guida' : null] },
    h('a', { class: 'salta', href: '#contenuto', onClick: (e) => { e.preventDefault(); contenuto.focus(); } }, 'Vai al contenuto'),
    barraDemo(ctx),
    h('div', { class: 'guscio-corpo' },
      menu,
      sfondo,
      h('div', { class: 'guscio-area' },
        h('header', { class: 'testata-mobile' }, burger, logo(dati)),
        contenuto),
      zonaGuida));

  document.documentElement.classList.remove('con-cassetto');
  return { radice, contenuto, zonaGuida };
}
