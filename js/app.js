// Avvio della demo: stato, salvataggio, router a hash, guscio, guida e popup.
import { carica, salva, ricomincia as ricominciaDati, pulisciNomeAgenzia } from './core/store.js';
import { creaDatiEsempio } from './core/seed.js';
import { risolvi } from './core/rotte.js';
import { segnaPasso as segnaPassoDati } from './core/guida.js';
import { h, svuota, icona } from './ui/dom.js';
import { riquadroInfo, intestazione, card } from './ui/componenti.js';
import { popupProva, finestraBenvenuto, conferma, finestraAperta } from './ui/popup.js';
import { disegnaGuscio, HOME_RUOLO } from './ui/guscio.js';
import { disegnaGuida } from './ui/guida-ui.js';
import { azzeraPagine } from './ui/reset.js';
import { titoloPagina } from './testi.js';
import { render as dashboard } from './pagine/titolare/dashboard.js';
import { render as eventi } from './pagine/titolare/eventi.js';
import { render as eventoForm } from './pagine/titolare/evento-form.js';
import { render as eventoScheda } from './pagine/titolare/evento-scheda.js';
import { render as calendario } from './pagine/titolare/calendario.js';
import { render as finanze } from './pagine/titolare/finanze.js';
import { render as artisti, renderScheda as artistaScheda } from './pagine/titolare/artisti.js';
import { render as clienti, renderScheda as clienteScheda } from './pagine/titolare/clienti.js';
import { render as location } from './pagine/titolare/location.js';
import { render as chiese } from './pagine/titolare/chiese.js';
import { render as appuntamenti } from './pagine/titolare/appuntamenti.js';
import { render as service } from './pagine/titolare/service.js';
import { render as archivio } from './pagine/titolare/archivio.js';
import { render as eventoChat } from './pagine/titolare/chat.js';
import { render as opzioni } from './pagine/titolare/opzioni.js';
import { render as artistaHome } from './pagine/artista/home.js';
import { render as artistaEventi } from './pagine/artista/eventi.js';
import { render as artistaEvento } from './pagine/artista/evento.js';
import { render as artistaCalendario } from './pagine/artista/calendario.js';
import { render as artistaProfilo } from './pagine/artista/profilo.js';
import { renderLocation as artistaLocation, renderChiese as artistaChiese } from './pagine/artista/luoghi.js';
import { render as clienteHome } from './pagine/cliente/home.js';
import { render as clienteEvento } from './pagine/cliente/evento.js';
import { render as clienteProfilo } from './pagine/cliente/profilo.js';

// Pagine costruite: pagina (come in ROTTE) -> render(ctx) che restituisce un elemento.
// Le pagine assenti mostrano il segnaposto «In costruzione».
// Esempio: import { render as dashboard } from './pagine/titolare/dashboard.js'; poi { dashboard, ... }
const PAGINE = { dashboard, eventi, 'evento-nuovo': eventoForm, 'evento-modifica': eventoForm, 'evento-scheda': eventoScheda, calendario, finanze,
  artisti, 'artista-scheda': artistaScheda, clienti, 'cliente-scheda': clienteScheda,
  location, chiese, appuntamenti, service, archivio, 'evento-chat': eventoChat, opzioni,
  // Aree dei ruoli «Vedi come»: Location e Chiese filtrano i luoghi dell'artista e riusano paginaLuoghi.
  'artista-home': artistaHome, 'artista-eventi': artistaEventi, 'artista-evento': artistaEvento,
  'artista-calendario': artistaCalendario, 'artista-location': artistaLocation, 'artista-chiese': artistaChiese,
  'artista-profilo': artistaProfilo,
  'cliente-home': clienteHome, 'cliente-evento': clienteEvento, 'cliente-profilo': clienteProfilo };

/** localStorage può lanciare solo a nominarlo (browser blindati): allora si lavora in memoria. */
function prendiStorage() {
  try {
    const s = window.localStorage;
    s.getItem('quinte-demo');
    return s;
  } catch (_) {
    return null;
  }
}

function normalizza(d) {
  if (!d.guida || !Array.isArray(d.guida.fatti)) d.guida = { aperta: true, fatti: [], finita: false };
  if (!Array.isArray(d.riquadriChiusi)) d.riquadriChiusi = [];
  if (!HOME_RUOLO[d.ruolo]) d.ruolo = 'titolare';
  return d;
}

const storage = prendiStorage();
const radice = document.getElementById('app');
const avvio = carica(storage, new Date(), creaDatiEsempio);
let dati = normalizza(avvio.dati);
let benvenutoInCorso = avvio.nuovo;
let ultimoHash = null;
let inDisegno = false;
let ridisegnoInCoda = false;

function hashCorrente() {
  return window.location.hash || '#/';
}

function pianificaRidisegno() {
  if (ridisegnoInCoda) return;
  ridisegnoInCoda = true;
  queueMicrotask(() => {
    ridisegnoInCoda = false;
    disegna();
  });
}

function apriPopup(motivo) {
  popupProva(motivo);
}

/** Applica fn ai dati, salva e ridisegna. Se la guida finisce qui, apre il popup. */
function aggiorna(fn) {
  const primaFinita = !!dati.guida.finita;
  if (fn) fn(dati);
  salva(storage, dati);
  disegna();
  if (!primaFinita && dati.guida.finita) queueMicrotask(() => popupProva('fine'));
}

/** Spunta un passo della guida. Si può chiamare anche durante render(ctx). */
function segnaPasso(id) {
  const esito = segnaPassoDati(dati, id);
  if (esito === 'gia') return esito;
  salva(storage, dati);
  pianificaRidisegno();
  if (esito === 'finita') queueMicrotask(() => popupProva('fine'));
  return esito;
}

function vai(hash) {
  if (hashCorrente() === hash) {
    ultimoHash = null; // stessa rotta: si ridisegna come cambio pagina
    disegna();
  } else {
    window.location.hash = hash;
  }
}

/** Cambia il ruolo di «Vedi come» e va alla sua home (o a `hash`). */
function cambiaRuolo(ruolo, hash) {
  if (!HOME_RUOLO[ruolo]) return;
  const primaFinita = !!dati.guida.finita;
  dati.ruolo = ruolo;
  if (ruolo === 'artista') segnaPassoDati(dati, 'artista');
  salva(storage, dati);
  vai(hash || HOME_RUOLO[ruolo]);
  if (!primaFinita && dati.guida.finita) popupProva('fine');
}

async function ricomincia() {
  const ok = await conferma(
    'Rimetto i dati di esempio e riapro la guida. Quello che hai fatto finora nella demo si cancella.',
    { titolo: 'Ricominciare la demo?', conferma: 'Ricomincia', pericolo: true },
  );
  if (!ok) return;
  dati = normalizza(ricominciaDati(dati, new Date(), creaDatiEsempio));
  dati.guida.aperta = true;
  azzeraPagine();
  salva(storage, dati);
  vai('#/');
}

function creaCtx(pagina, params) {
  return {
    dati, pagina, params,
    aggiorna, vai, apriPopup, segnaPasso, cambiaRuolo, ricomincia,
    conferma: (testo, opzioni) => conferma(testo, opzioni),
  };
}

function segnaposto(ctx) {
  return h('div', { class: 'segnaposto' },
    intestazione({ titolo: titoloPagina(ctx.pagina, ctx.params) }),
    card(null, h('div', { class: 'in-costruzione' },
      h('span', { class: 'in-costruzione-icona' }, icona('hammer')),
      h('h2', {}, 'In costruzione'),
      h('p', {}, 'Questa pagina della demo è in preparazione. Intanto puoi esplorare le altre voci del menu.'))));
}

function paginaInErrore() {
  return card(null, h('div', { class: 'in-costruzione' },
    h('span', { class: 'in-costruzione-icona' }, icona('warning')),
    h('h2', {}, 'Qualcosa non ha funzionato'),
    h('p', {}, 'Torna alla dashboard o usa «Ricomincia» nella barra in alto.')));
}

function chiaveDelFuoco() {
  const el = document.activeElement;
  if (!el || el === document.body || !radice.contains(el)) return null;
  const conChiave = el.closest('[data-fuoco]');
  if (conChiave) return `[data-fuoco="${conChiave.dataset.fuoco}"]`;
  // Senza chiave (es. il riquadro appena chiuso) il focus torna al contenuto.
  return el.id ? `#${CSS.escape(el.id)}` : '#contenuto';
}

function disegna() {
  if (inDisegno) { pianificaRidisegno(); return; }
  inDisegno = true;
  try {
    const hash = hashCorrente();
    const { pagina, params } = risolvi(hash, dati.ruolo);
    const primoDisegno = ultimoHash === null && !radice.firstChild;
    const cambioPagina = hash !== ultimoHash;
    const selettoreFuoco = cambioPagina ? null : chiaveDelFuoco();
    const scorrimento = window.scrollY;

    const ctx = creaCtx(pagina, params);
    const { radice: guscio, contenuto, zonaGuida } = disegnaGuscio(ctx);

    let corpo;
    try {
      corpo = (PAGINE[pagina] || segnaposto)(ctx);
    } catch (err) {
      console.error(err);
      corpo = paginaInErrore();
    }
    // Il riquadro «Cosa stai vedendo» va in cima a ogni pagina, se la pagina non lo mette già.
    const info = riquadroInfo(ctx, pagina);
    if (info && !(corpo && corpo.querySelector && corpo.querySelector('.riquadro-info'))) contenuto.append(info);
    if (corpo) contenuto.append(corpo);
    zonaGuida.append(disegnaGuida(ctx));

    svuota(radice).append(guscio);

    if (cambioPagina) {
      ultimoHash = hash;
      window.scrollTo(0, 0);
      if (!primoDisegno && !finestraAperta()) contenuto.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, scorrimento);
      if (!finestraAperta()) {
        const el = selettoreFuoco ? radice.querySelector(selettoreFuoco) : null;
        if (el) el.focus({ preventScroll: true });
        else if (selettoreFuoco) contenuto.focus({ preventScroll: true });
      }
    }

    if (pagina === 'dashboard' && !benvenutoInCorso) segnaPasso('dashboard');
  } finally {
    inDisegno = false;
  }
}

window.addEventListener('hashchange', () => disegna());
// Passando sopra o sotto i 768 px guida e cassetto cambiano forma: si ridisegna.
if (typeof window.matchMedia === 'function') {
  window.matchMedia('(max-width: 767.98px)').addEventListener('change', () => disegna());
}

if (benvenutoInCorso) {
  if (hashCorrente() !== '#/') window.history.replaceState(null, '', '#/');
  disegna();
  finestraBenvenuto().then((nome) => {
    benvenutoInCorso = false;
    dati.agenzia = pulisciNomeAgenzia(nome);
    salva(storage, dati);
    vai('#/');
  });
} else {
  disegna();
}
