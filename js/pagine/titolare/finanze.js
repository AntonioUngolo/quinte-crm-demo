// Finanze & Spese: movimenti, riepilogo mensile, spese per categoria, margine per evento.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, tabella, kpi, campo } from '../../ui/componenti.js';
import { apriFinestra } from '../../ui/popup.js';
import {
  movimenti, riepilogoMensile, spesePerCategoria, utileEvento, incassato, senzaTotale,
} from '../../core/calcoli.js';
import { aggiungiSpesa, eliminaSpesa, trovaEvento } from '../../core/azioni.js';
import { movimentiCSV } from '../../core/csv.js';
import { leggiImporto, euro } from '../../core/numeri.js';
import { registraReset } from '../../ui/reset.js';
import { oggiISO, formatoBreve, nomeMese } from '../../core/date.js';

const VISTE = [
  { id: 'movimenti', etichetta: 'Movimenti' },
  { id: 'riepilogo', etichetta: 'Riepilogo mensile' },
  { id: 'categorie', etichetta: 'Spese per categoria' },
  { id: 'margine', etichetta: 'Margine per evento' },
];
const TIPI = ['Entrata', 'Uscita'];

// Il testo cercato resta qui: non fa ridisegnare la pagina e non è nell'indirizzo.
let cerca = '';
// Avviso dopo il salvataggio: si vede solo nella pagina (indirizzo) in cui è nato.
let avviso = null;
registraReset(() => { cerca = ''; avviso = null; });
// Qualsiasi cambio di indirizzo (altra pagina, filtro, Indietro) lo toglie, prima del ridisegno.
window.addEventListener('hashchange', () => { avviso = null; }, true);

const somma = (xs) => Math.round(xs.reduce((t, x) => t + x, 0) * 100) / 100;
const annoDi = (iso) => Number(String(iso || '').slice(0, 4));

/** Legge i filtri dall'indirizzo (anno di default: quello corrente). */
function leggiFiltri(params) {
  const corrente = annoDi(oggiISO(new Date()));
  const a = Number(params.anno);
  const m = Number(params.mese);
  return {
    anno: Number.isInteger(a) && a >= 1900 && a <= 2200 ? a : corrente,
    mese: Number.isInteger(m) && m >= 1 && m <= 12 ? m : null,
    tipo: TIPI.includes(params.tipo) ? params.tipo : '',
    vista: VISTE.some((v) => v.id === params.vista) ? params.vista : 'movimenti',
  };
}

/** Indirizzo con i filtri; i valori di default restano fuori. */
function indirizzo(f) {
  const q = [];
  if (f.anno !== annoDi(oggiISO(new Date()))) q.push(`anno=${f.anno}`);
  if (f.mese) q.push(`mese=${f.mese}`);
  if (f.tipo) q.push(`tipo=${encodeURIComponent(f.tipo)}`);
  if (f.vista !== 'movimenti') q.push(`vista=${f.vista}`);
  return `#/finanze${q.length ? `?${q.join('&')}` : ''}`;
}

function anniDisponibili(dati, corrente) {
  const anni = new Set([corrente, annoDi(oggiISO(new Date()))]);
  for (const e of dati.eventi) {
    if (e.data) anni.add(annoDi(e.data));
    for (const a of e.acconti || []) if (a.data) anni.add(annoDi(a.data));
  }
  for (const s of dati.spese) if (s.data) anni.add(annoDi(s.data));
  return [...anni].filter(Number.isFinite).sort((a, b) => b - a);
}

const eventoDi = (dati, id) => (id ? trovaEvento(dati, id) : null);
const linkEvento = (e, sezione) => `#/eventi/${encodeURIComponent(e.id)}${sezione ? `?sezione=${sezione}` : ''}`;

function badgeTipo(tipo) {
  const entrata = tipo === 'Entrata';
  return h('span', { class: `badge badge--${entrata ? 'verde' : 'rosso'}` },
    h('span', { class: 'badge-pallino', 'aria-hidden': 'true' }), tipo);
}

const importoConSegno = (m) => `${m.tipo === 'Entrata' ? '+' : '−'} ${euro(m.importo)}`;

function scaricaCSV(righe) {
  const blob = new Blob([movimentiCSV(righe)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: 'quinte-demo-movimenti.csv', style: { display: 'none' } });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ------------------------------------------------------------ finestra «Aggiungi spesa»

function finestraSpesa(ctx) {
  const { dati } = ctx;
  const eventi = dati.eventi
    .filter((e) => e.stato !== 'Cancellato')
    .sort((a, b) => (a.data || '').localeCompare(b.data || ''))
    .map((e) => ({ valore: e.id, etichetta: `${e.titolo || 'Senza titolo'}${e.data ? ` (${formatoBreve(e.data)})` : ''}` }));
  const categorie = dati.opzioni.categorieSpese;

  const corpo = h('div', { class: 'spesa-form' });
  // Scelto un evento, la data della spesa diventa quella dell'evento (resta modificabile).
  function sceltoEvento(ev) {
    const e = eventoDi(dati, ev.target.value);
    const campoData = corpo.querySelector('[name="data"]');
    if (e && e.data && campoData) campoData.value = e.data;
  }
  function disegna(v, errori = {}) {
    corpo.replaceChildren(
      h('p', { class: 'incarico-intro' }, 'Scegli un evento per aggiornarne il margine. Senza evento è una spesa dell’agenzia.'),
      campo({
        etichetta: 'Data', nome: 'data', tipo: 'date', valore: v.data, richiesto: true,
        errore: errori.data, attributi: { 'data-fuoco': 'spesa-data' },
      }),
      campo({
        etichetta: 'Voce', nome: 'voce', valore: v.voce, richiesto: true, errore: errori.voce,
        segnaposto: 'Ad esempio Noleggio impianto luci',
        attributi: { autocomplete: 'off', 'data-fuoco': 'spesa-voce', 'data-autofocus': '' },
      }),
      campo({
        etichetta: 'Categoria', nome: 'categoria', tipo: 'select', valore: v.categoria,
        opzioni: categorie, errore: errori.categoria, attributi: { 'data-fuoco': 'spesa-categoria' },
      }),
      campo({
        etichetta: 'Importo (€)', nome: 'importo', valore: v.importo, richiesto: true, errore: errori.importo,
        segnaposto: 'Ad esempio 300 oppure 1.500,50',
        attributi: { inputmode: 'decimal', autocomplete: 'off', 'data-fuoco': 'spesa-importo' },
      }),
      campo({
        etichetta: 'Evento', nome: 'eventoId', tipo: 'select', valore: v.eventoId,
        opzioni: eventi, vuota: 'Nessuno: spesa dell’agenzia', aiuto: 'Facoltativo. Se scegli un evento, la data diventa quella dell’evento: puoi cambiarla.',
        attributi: { 'data-fuoco': 'spesa-evento', onChange: sceltoEvento },
      }));
    const primo = Object.keys(errori)[0];
    if (primo) corpo.querySelector(`[name="${primo}"]`)?.focus();
  }
  disegna({ data: oggiISO(new Date()), voce: '', categoria: categorie[0] || '', importo: '', eventoId: '' });

  apriFinestra({
    titolo: 'Aggiungi spesa',
    classe: 'finestra--larga',
    corpo,
    azioni: [
      { etichetta: 'Annulla', variante: 'secondario' },
      { etichetta: 'Aggiungi spesa', variante: 'primario', tipo: 'submit' },
    ],
    suInvio: (ev, chiudi) => {
      const el = ev.currentTarget.elements;
      const v = {
        data: el.data.value, voce: el.voce.value.trim(), categoria: el.categoria.value,
        importo: el.importo.value, eventoId: el.eventoId.value,
      };
      const importo = leggiImporto(v.importo);
      const errori = {};
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.data)) errori.data = 'Scegli la data della spesa.';
      if (!v.voce) errori.voce = 'Scrivi che cosa hai speso.';
      if (!categorie.includes(v.categoria)) errori.categoria = 'Scegli una categoria.';
      if (importo === null || importo <= 0) errori.importo = 'Scrivi un importo maggiore di zero, ad esempio 300 o 1.500,50.';
      if (Object.keys(errori).length) { disegna(v, errori); return; }

      chiudi();
      ctx.aggiorna((d) => {
        aggiungiSpesa(d, { data: v.data, voce: v.voce, categoria: v.categoria, importo, eventoId: v.eventoId || null });
        const e = eventoDi(d, v.eventoId);
        if (!e) {
          avviso = { testo: `Spesa dell’agenzia aggiunta: ${euro(importo)}` };
          return;
        }
        const titolo = e.titolo || 'Senza titolo';
        const guarda = { etichetta: 'Guarda il margine', href: `#/finanze?vista=margine&anno=${annoDi(e.data) || annoDi(oggiISO(new Date()))}` };
        avviso = senzaTotale(e)
          ? {
            testo: `Spesa aggiunta a ${titolo}. Inserisci il totale dell’evento per vedere il margine.`,
            link: [{ etichetta: 'Inserisci il totale', href: `#/eventi/${encodeURIComponent(e.id)}/modifica` }, guarda],
          }
          : { testo: `Margine di ${titolo} aggiornato: ${euro(utileEvento(d, e))}`, link: [guarda] };
      });
      ctx.segnaPasso('spesa');
    },
  });
}

// ------------------------------------------------------------------------- viste

function selezionePeriodo(ctx, f, { conMese, conTipo }) {
  const vaiCon = (cambio) => ctx.vai(indirizzo({ ...f, ...cambio }));
  const anni = anniDisponibili(ctx.dati, f.anno);
  const select = (nome, etichetta, valore, opzioni, suCambio) => h('select', {
    class: 'controllo filtro-select', name: nome, 'aria-label': etichetta, 'data-fuoco': `filtro-${nome}`, value: valore,
    onChange: (e) => suCambio(e.target.value),
  }, opzioni.map(([v, t]) => h('option', { value: v }, t)));
  return [
    select('anno', 'Anno', String(f.anno), anni.map((a) => [String(a), String(a)]), (v) => vaiCon({ anno: Number(v) })),
    conMese ? select('mese', 'Mese', f.mese ? String(f.mese) : '',
      [['', 'Tutti i mesi'], ...Array.from({ length: 12 }, (_, i) => [String(i + 1), nomeMese(i)])],
      (v) => vaiCon({ mese: v ? Number(v) : null })) : null,
    conTipo ? select('tipo', 'Tipo di movimento', f.tipo,
      [['', 'Entrate e uscite'], ['Entrata', 'Solo entrate'], ['Uscita', 'Solo uscite']],
      (v) => vaiCon({ tipo: v })) : null,
  ];
}

function vistaMovimenti(ctx, f) {
  const { dati } = ctx;
  const base = movimenti(dati, { anno: f.anno, mese: f.mese, tipo: f.tipo });
  const titoloEvento = (m) => (eventoDi(dati, m.eventoId) || {}).titolo || '';

  const zona = h('div', { 'aria-live': 'polite' });
  const piede = h('div', { class: 'card-piede' });
  const conteggio = h('span', { class: 'conteggio' });
  let visibili = base;

  const csv = h('button', {
    type: 'button', class: 'btn btn-secondario', 'data-fuoco': 'esporta-csv',
    onClick: () => scaricaCSV(visibili),
  }, icona('download-simple'), h('span', {}, 'Esporta CSV'));

  function filtra() {
    const q = cerca.trim().toLowerCase();
    visibili = q
      ? base.filter((m) => [m.voce, m.categoria, titoloEvento(m)].some((t) => (t || '').toLowerCase().includes(q)))
      : base;
    conteggio.textContent = `${visibili.length} ${visibili.length === 1 ? 'movimento' : 'movimenti'}`;
    zona.replaceChildren(tabella([
      {
        titolo: 'Voce',
        valore: (m) => h('div', { class: 'cella-evento' },
          h('span', { class: 'cella-evento-titolo' }, m.voce),
          h('span', { class: 'cella-evento-sotto' }, m.categoria)),
      },
      { titolo: 'Data', valore: (m) => formatoBreve(m.data) },
      {
        titolo: 'Evento',
        valore: (m) => {
          const e = eventoDi(dati, m.eventoId);
          if (!e) return m.tipo === 'Uscita' ? 'Spesa dell’agenzia' : '';
          return h('a', { class: 'link-testo', href: linkEvento(e) }, e.titolo || 'Senza titolo');
        },
      },
      { titolo: 'Tipo', valore: (m) => badgeTipo(m.tipo) },
      {
        titolo: 'Importo', allinea: 'destra', classe: 'importo',
        valore: (m) => h('span', { class: m.tipo === 'Entrata' ? 'importo-entrata' : 'importo-uscita' }, importoConSegno(m)),
      },
      { titolo: 'Azioni', allinea: 'destra', valore: (m) => azioniSpesa(ctx, m) },
    ], visibili, {
      etichetta: 'Movimenti',
      vuoto: base.length ? 'Nessun movimento corrisponde alla ricerca.' : 'Nessun movimento nel periodo scelto.',
    }));
    piede.replaceChildren(
      h('span', {}, `Visualizzati ${visibili.length} di ${base.length} movimenti`),
      h('span', { class: 'piede-totali' },
        h('span', { class: 'importo-entrata' }, `Entrate ${euro(somma(visibili.filter((m) => m.tipo === 'Entrata').map((m) => m.importo)))}`),
        h('span', { class: 'importo-uscita' }, `Uscite ${euro(somma(visibili.filter((m) => m.tipo === 'Uscita').map((m) => m.importo)))}`)));
  }

  const ricerca = h('div', { class: 'ricerca' },
    icona('magnifying-glass'),
    h('input', {
      type: 'search', class: 'controllo', name: 'cerca', 'aria-label': 'Cerca evento o voce',
      placeholder: 'Cerca evento o voce…', value: cerca, autocomplete: 'off',
      onInput: (e) => { cerca = e.target.value; filtra(); },
    }));
  filtra();

  return {
    azioniPagina: [csv],
    corpo: card({
      titolo: h('span', {}, 'Movimenti', conteggio),
      sottotitolo: 'Acconti incassati e spese, dal più recente.',
      piatto: true,
    },
    h('div', { class: 'filtri' }, ricerca, ...selezionePeriodo(ctx, f, { conMese: true, conTipo: true })),
    zona, piede),
  };
}

function azioniSpesa(ctx, m) {
  if (m.tipo !== 'Uscita') return '';
  if (m.origine === 'cachet') {
    const e = eventoDi(ctx.dati, m.eventoId);
    return h('span', { class: 'nota-cachet' },
      'Si toglie dal cast dell’evento',
      e ? h('a', { class: 'link-testo', href: linkEvento(e, 'cast') }, 'Vai al cast') : null);
  }
  return h('button', {
    type: 'button', class: 'btn btn-terziario btn-sm', 'data-fuoco': `elimina-${m.spesaId}`,
    'aria-label': `Elimina la spesa ${m.voce}`,
    onClick: async () => {
      const ok = await ctx.conferma(`Eliminare la spesa «${m.voce}» di ${euro(m.importo)}? ${m.eventoId ? 'Il margine dell’evento torna a salire.' : 'È una spesa dell’agenzia, nessun evento cambia.'}`,
        { titolo: 'Eliminare la spesa?', conferma: 'Elimina', pericolo: true });
      if (ok) ctx.aggiorna((d) => { eliminaSpesa(d, m.spesaId); avviso = { testo: `Spesa eliminata: ${m.voce}, ${euro(m.importo)}` }; });
    },
  }, icona('trash'), h('span', {}, 'Elimina'));
}

function eventiDellAnno(dati, anno) {
  return dati.eventi.filter((e) => e.stato !== 'Cancellato' && annoDi(e.data) === anno)
    .sort((a, b) => (a.data || '').localeCompare(b.data || ''));
}

function piedeCard(...parti) {
  return h('div', { class: 'card-piede' }, ...parti);
}

function vistaRiepilogo(ctx, f) {
  const { dati } = ctx;
  const mensile = riepilogoMensile(dati, f.anno);
  const eventi = eventiDellAnno(dati, f.anno);
  const righe = mensile.map((r) => {
    const delMese = eventi.filter((e) => Number(e.data.slice(5, 7)) === r.mese);
    const totale = somma(delMese.map((e) => e.totale));
    return {
      mese: r.mese, eventi: delMese.length, totale, incassato: r.entrate, spese: r.uscite, margine: somma([totale, -r.uscite]),
    };
  }).filter((r) => r.eventi || r.incassato || r.spese);
  const tot = (campoRiga) => somma(righe.map((r) => r[campoRiga]));
  const negativo = (n) => (n < 0 ? 'importo-uscita' : '');

  return {
    azioniPagina: [],
    corpo: card({
      titolo: 'Riepilogo mensile',
      sottotitolo: 'Eventi e totale per mese dell’evento, incassato e spese per mese del movimento.',
      piatto: true,
    },
    h('div', { class: 'filtri' }, ...selezionePeriodo(ctx, f, {})),
    tabella([
      { titolo: 'Mese', valore: (r) => `${nomeMese(r.mese - 1)} ${f.anno}` },
      { titolo: 'Eventi', valore: (r) => String(r.eventi), allinea: 'destra' },
      { titolo: 'Totale eventi', valore: (r) => euro(r.totale), allinea: 'destra' },
      { titolo: 'Incassato', valore: (r) => euro(r.incassato), allinea: 'destra' },
      { titolo: 'Spese', valore: (r) => euro(r.spese), allinea: 'destra' },
      { titolo: 'Margine', valore: (r) => h('span', { class: negativo(r.margine) }, euro(r.margine)), allinea: 'destra' },
    ], righe, { etichetta: 'Riepilogo mensile', vuoto: `Nessun evento, acconto o spesa nel ${f.anno}.` }),
    righe.length ? piedeCard(
      h('span', {}, `Totale ${f.anno} · ${tot('eventi')} ${tot('eventi') === 1 ? 'evento' : 'eventi'} · ${euro(tot('totale'))}`),
      h('span', { class: 'piede-totali' },
        h('span', { class: 'importo-uscita' }, `Spese ${euro(tot('spese'))}`),
        h('span', { class: tot('margine') < 0 ? 'importo-uscita' : 'importo-entrata' }, `Margine ${euro(tot('margine'))}`))) : null),
  };
}

function vistaCategorie(ctx, f) {
  const righe = spesePerCategoria(ctx.dati, f.anno);
  const totale = somma(righe.map((r) => r.totale));
  return {
    azioniPagina: [],
    corpo: card({
      titolo: 'Spese per categoria',
      sottotitolo: `Tutte le spese del ${f.anno}, dalla categoria più pesante.`,
      piatto: true,
    },
    h('div', { class: 'filtri' }, ...selezionePeriodo(ctx, f, {})),
    tabella([
      { titolo: 'Categoria', valore: (r) => r.categoria },
      {
        titolo: 'Peso sul totale',
        valore: (r) => h('div', { class: 'barra-peso' },
          h('span', { class: 'barra-peso-riempi', style: { width: `${totale ? Math.round((r.totale / totale) * 100) : 0}%` }, 'aria-hidden': 'true' }),
          h('span', { class: 'barra-peso-testo' }, `${totale ? Math.round((r.totale / totale) * 100) : 0}%`)),
      },
      { titolo: 'Totale', valore: (r) => euro(r.totale), allinea: 'destra' },
    ], righe, { etichetta: 'Spese per categoria', vuoto: `Nessuna spesa nel ${f.anno}.` }),
    righe.length ? piedeCard(
      h('span', {}, `${righe.length} ${righe.length === 1 ? 'categoria' : 'categorie'}`),
      h('span', { class: 'piede-totali' }, h('span', { class: 'importo-uscita' }, `Totale spese ${euro(totale)}`))) : null),
  };
}

function vistaMargine(ctx, f) {
  const { dati } = ctx;
  const eventi = eventiDellAnno(dati, f.anno);
  const totale = somma(eventi.map((e) => e.totale));
  // Gli eventi senza totale non hanno un margine da sommare.
  const utile = somma(eventi.filter((e) => !senzaTotale(e)).map((e) => utileEvento(dati, e)));
  return {
    azioniPagina: [],
    corpo: card({
      titolo: 'Margine per evento',
      sottotitolo: 'Totale dell’evento meno le sue spese (cachet compresi), senza le spese dell’agenzia. Gli eventi cancellati non sono contati.',
      piatto: true,
    },
    h('div', { class: 'filtri' }, ...selezionePeriodo(ctx, f, {})),
    tabella([
      {
        titolo: 'Evento',
        valore: (e) => h('a', { class: 'link-testo', href: linkEvento(e) }, e.titolo || 'Senza titolo'),
      },
      { titolo: 'Data', valore: (e) => formatoBreve(e.data) },
      { titolo: 'Totale', valore: (e) => euro(e.totale), allinea: 'destra' },
      { titolo: 'Spese', valore: (e) => euro(somma(dati.spese.filter((s) => s.eventoId === e.id).map((s) => s.importo))), allinea: 'destra' },
      {
        titolo: 'Utile', allinea: 'destra',
        valore: (e) => {
          if (senzaTotale(e)) {
            return h('span', { class: 'nota-cachet' }, 'Totale da inserire',
              h('a', { class: 'link-testo', href: `#/eventi/${encodeURIComponent(e.id)}/modifica` }, 'Modifica l’evento'));
          }
          const u = utileEvento(dati, e);
          return h('span', { class: u < 0 ? 'importo-uscita' : 'importo-entrata' }, euro(u));
        },
      },
    ], eventi, { etichetta: 'Margine per evento', vuoto: `Nessun evento nel ${f.anno}.` }),
    eventi.length ? piedeCard(
      h('span', {}, `${eventi.length} ${eventi.length === 1 ? 'evento' : 'eventi'} · totale ${euro(totale)}`),
      h('span', { class: 'piede-totali' },
        h('span', { class: utile < 0 ? 'importo-uscita' : 'importo-entrata' }, `Utile degli eventi, senza spese dell’agenzia ${euro(utile)}`))) : null),
  };
}

const VISTA = { movimenti: vistaMovimenti, riepilogo: vistaRiepilogo, categorie: vistaCategorie, margine: vistaMargine };

// ------------------------------------------------------------------------- pagina

function kpiAnno(dati, anno) {
  const eventi = eventiDellAnno(dati, anno);
  const tutti = movimenti(dati, { anno });
  const entrate = somma(tutti.filter((m) => m.tipo === 'Entrata').map((m) => m.importo));
  const spese = somma(tutti.filter((m) => m.tipo === 'Uscita').map((m) => m.importo));
  const totale = somma(eventi.map((e) => e.totale));
  return {
    incassato: entrate, totale, spese,
    daIncassare: somma(eventi.map((e) => e.totale - incassato(e))),
    margine: somma([totale, -spese]),
  };
}

export function render(ctx) {
  const f = leggiFiltri(ctx.params);
  const k = kpiAnno(ctx.dati, f.anno);
  const { azioniPagina, corpo } = VISTA[f.vista](ctx, f);

  const schede = h('nav', { class: 'schede', 'aria-label': 'Sezioni di Finanze e spese' },
    VISTE.map((s) => h('a', {
      class: ['scheda-voce', s.id === f.vista ? 'scheda-voce--attiva' : null],
      href: indirizzo({ ...f, vista: s.id }),
      'aria-current': s.id === f.vista ? 'page' : null,
      'data-fuoco': `vista-${s.id}`,
      onClick: (ev) => { ev.preventDefault(); ctx.vai(indirizzo({ ...f, vista: s.id })); },
    }, h('span', {}, s.etichetta))));
  const selettore = h('div', { class: 'schede-select' },
    h('label', { class: 'campo-etichetta', for: 'vista-finanze' }, 'Sezione'),
    h('select', {
      id: 'vista-finanze', class: 'controllo', 'data-fuoco': 'vista-select', value: f.vista,
      onChange: (ev) => ctx.vai(indirizzo({ ...f, vista: ev.target.value })),
    }, VISTE.map((s) => h('option', { value: s.id }, s.etichetta))));

  const mostraAvviso = !!avviso;

  return h('div', { class: 'pagina-finanze' },
    intestazione({
      titolo: 'Finanze & Spese',
      sottotitolo: 'Incassi, spese e margine degli eventi. Metriche e tabelle seguono l’anno scelto nei filtri.',
      azioni: [
        ...azioniPagina,
        h('button', { type: 'button', class: 'btn btn-primario', 'data-fuoco': 'aggiungi-spesa', onClick: () => finestraSpesa(ctx) },
          icona('plus'), h('span', {}, 'Aggiungi spesa')),
      ],
    }),
    mostraAvviso ? h('div', { class: 'avviso-ok', role: 'status' }, icona('check-circle', true), h('span', {}, avviso.testo),
      ...(avviso.link || []).map((l) => h('a', { class: 'link-testo', href: l.href, 'data-fuoco': 'avviso-link' }, l.etichetta))) : null,
    h('div', { class: 'griglia-kpi' },
      kpi('Incassato', euro(k.incassato), `acconti ricevuti nel ${f.anno}`, 'wallet'),
      kpi('Da incassare', euro(k.daIncassare), `su ${euro(k.totale)} di eventi nel ${f.anno}`, 'hand-coins'),
      kpi('Spese', euro(k.spese), 'cachet, service e altre voci', 'receipt'),
      kpi('Margine', euro(k.margine), 'totale eventi meno tutte le spese, anche dell’agenzia', 'trend-up')),
    schede, selettore,
    corpo);
}
