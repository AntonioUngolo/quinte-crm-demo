// Nuovo evento e modifica evento: stesso modulo, sezioni come nell'app.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, campo, statoVuoto } from '../../ui/componenti.js';
import { creaEvento, modificaEvento, eliminaEvento, trovaEvento } from '../../core/azioni.js';
import { leggiImporto, euro } from '../../core/numeri.js';
import { ID_CLIENTE_DEMO } from '../../core/seed.js';
import { eDataISO } from '../../core/agenda-viste.js';

const MAX_ACCONTI = 6;
const FASCE = ['Pranzo', 'Cena'];
const RITI = ['Religioso', 'Civile'];
const PROVENIENZE = ['Diretto', 'Instagram', 'Location', 'Passaparola', 'Wedding planner'];
const TIPI_CERIMONIA = ['Matrimonio', 'Cerimonia'];

const testoImporto = (n) => (n || n === 0 ? euro(n).replace('€ ', '') : '');

function stato0(dati, evento) {
  if (evento) {
    return {
      titolo: evento.titolo || '', tipo: evento.tipo || 'Matrimonio', stato: evento.stato || 'In opzione',
      referente: evento.referente || '', provenienza: evento.provenienza || '',
      data: evento.data || '', fascia: evento.fascia || 'Cena', locationId: evento.locationId || '',
      invitati: evento.invitati ? String(evento.invitati) : '',
      clienteId: evento.clienteId || '', rito: evento.rito || '', chiesaId: evento.chiesaId || '',
      totale: evento.totale ? testoImporto(evento.totale) : '',
      acconti: (evento.acconti || []).map((a) => ({ importo: testoImporto(a.importo), data: a.data || '' })),
      note: evento.note || '',
    };
  }
  const cliente = dati.clienti.some((c) => c.id === ID_CLIENTE_DEMO) ? ID_CLIENTE_DEMO : '';
  return {
    titolo: '', tipo: 'Matrimonio', stato: 'In opzione', referente: '', provenienza: '',
    data: '', fascia: 'Cena', locationId: '', invitati: '', clienteId: cliente, rito: '', chiesaId: '',
    totale: '', acconti: [], note: '',
  };
}

/** Controlla i valori e restituisce { errori, campi }. */
function valida(v) {
  const errori = {};
  const campi = {};
  if (!v.titolo.trim()) errori.titolo = 'Scrivi il titolo dell’evento.';
  if (!v.data) errori.data = 'Scegli la data dell’evento.';

  const inv = v.invitati.trim();
  if (inv) {
    if (!/^\d{1,5}$/.test(inv)) errori.invitati = 'Inserisci un numero intero, ad esempio 120.';
  }

  const tot = v.totale.trim();
  let totale = 0;
  if (tot) {
    totale = leggiImporto(tot);
    if (totale === null) errori.totale = 'Importo non valido. Scrivi ad esempio 1.500,50.';
  }

  const acconti = [];
  v.acconti.forEach((a, i) => {
    const imp = a.importo.trim();
    if (!imp && !a.data) return;
    const n = imp ? leggiImporto(imp) : null;
    if (n === null) errori[`acconto-importo-${i}`] = 'Importo non valido. Scrivi ad esempio 500.';
    if (!a.data) errori[`acconto-data-${i}`] = 'Scegli la data del pagamento.';
    if (n !== null && a.data) acconti.push({ importo: n, data: a.data });
  });

  // Con un totale concordato, gli acconti non possono superarlo (il saldo non va sotto zero).
  const incassati = Math.round(acconti.reduce((s, a) => s + a.importo, 0) * 100) / 100;
  if (!errori.totale && totale > 0 && incassati > totale) {
    errori.totale = `Gli acconti (${euro(incassati)}) superano il totale dell’evento (${euro(totale)}). Correggi il totale o gli acconti.`;
  }

  if (!Object.keys(errori).length) {
    const cerimonia = TIPI_CERIMONIA.includes(v.tipo);
    Object.assign(campi, {
      titolo: v.titolo.trim(), tipo: v.tipo, stato: v.stato, referente: v.referente.trim(),
      provenienza: v.provenienza, data: v.data, fascia: v.fascia, locationId: v.locationId || null,
      invitati: inv ? Number(inv) : 0, clienteId: v.clienteId || null,
      rito: cerimonia && v.rito ? v.rito : null,
      chiesaId: cerimonia && v.rito === 'Religioso' && v.chiesaId ? v.chiesaId : null,
      totale, acconti, note: v.note.trim(),
    });
  }
  return { errori, campi };
}

export function render(ctx) {
  const { dati } = ctx;
  const modifica = ctx.pagina === 'evento-modifica';
  const evento = modifica ? trovaEvento(dati, ctx.params.id) : null;

  if (modifica && !evento) {
    return h('div', {},
      intestazione({ titolo: 'Evento non trovato' }),
      card(null, statoVuoto('Questo evento non esiste più. Torna all’elenco per sceglierne un altro.', 'calendar-x'),
        h('div', { class: 'azioni-centro' },
          h('button', { type: 'button', class: 'btn btn-primario', onClick: () => ctx.vai('#/eventi') }, 'Vai agli eventi'))));
  }

  const v = stato0(dati, evento);
  // Dal calendario («Aggiungi» su uno spazio vuoto) la data arriva già scelta.
  if (!modifica && eDataISO(ctx.params.data)) v.data = ctx.params.data;
  let errori = {};
  const tornaA = modifica ? `#/eventi/${encodeURIComponent(evento.id)}` : '#/eventi';

  const form = h('form', { class: 'form-evento', novalidate: true, 'aria-label': modifica ? 'Modifica evento' : 'Nuovo evento' });
  const zonaCerimonia = h('div');
  const zonaAcconti = h('div');

  // Aggiorna un valore mentre si scrive, senza ridisegnare.
  const scrivi = (chiave) => (e) => { v[chiave] = e.target.value; };
  const attr = (chiave, extra = {}) => ({ 'data-fuoco': `ev-${chiave}`, onInput: scrivi(chiave), onChange: scrivi(chiave), ...extra });

  const opzioniStato = [...dati.opzioni.stati];
  if (v.stato && !opzioniStato.includes(v.stato)) opzioniStato.push(v.stato);
  const opzioniTipo = [...dati.opzioni.tipi];
  if (v.tipo && !opzioniTipo.includes(v.tipo)) opzioniTipo.push(v.tipo);

  function sezione(titolo, sottotitolo, ...figli) {
    return card({ titolo, sottotitolo }, h('div', { class: 'form-griglia' }, figli));
  }

  function disegnaCerimonia() {
    if (!TIPI_CERIMONIA.includes(v.tipo)) { zonaCerimonia.replaceChildren(); return; }
    zonaCerimonia.replaceChildren(sezione('Cerimonia', 'Rito e chiesa, se la cerimonia è religiosa.',
      campo({
        etichetta: 'Rito', nome: 'rito', tipo: 'select', valore: v.rito, opzioni: RITI, vuota: 'Da definire',
        attributi: { 'data-fuoco': 'ev-rito', onChange: (e) => { v.rito = e.target.value; disegnaCerimonia(); } },
      }),
      v.rito === 'Religioso'
        ? campo({
          etichetta: 'Chiesa', nome: 'chiesaId', tipo: 'select', valore: v.chiesaId, vuota: 'Da definire',
          opzioni: dati.chiese.map((c) => ({ valore: c.id, etichetta: `${c.nome}, ${c.citta}` })),
          attributi: attr('chiesaId'),
        })
        : null));
  }

  function disegnaAcconti() {
    const righe = v.acconti.map((a, i) => h('div', { class: 'acconto-riga' },
      campo({
        etichetta: `Importo acconto ${i + 1}`, nome: `acconto-importo-${i}`, valore: a.importo, segnaposto: 'Ad esempio 500',
        errore: errori[`acconto-importo-${i}`],
        attributi: { inputmode: 'decimal', 'data-fuoco': `ev-acc-imp-${i}`, onInput: (e) => { a.importo = e.target.value; } },
      }),
      campo({
        etichetta: `Data acconto ${i + 1}`, nome: `acconto-data-${i}`, tipo: 'date', valore: a.data,
        errore: errori[`acconto-data-${i}`],
        attributi: { 'data-fuoco': `ev-acc-data-${i}`, onInput: (e) => { a.data = e.target.value; }, onChange: (e) => { a.data = e.target.value; } },
      }),
      h('button', {
        type: 'button', class: 'btn btn-terziario btn-sm acconto-togli', 'aria-label': `Togli acconto ${i + 1}`,
        onClick: () => { v.acconti.splice(i, 1); disegnaAcconti(); },
      }, icona('trash'), h('span', {}, 'Togli'))));
    zonaAcconti.replaceChildren(
      h('h3', { class: 'form-sottotitolo' }, 'Acconti'),
      righe.length ? h('div', { class: 'acconti-elenco' }, righe)
        : h('p', { class: 'campo-aiuto' }, 'Nessun acconto registrato.'),
      v.acconti.length < MAX_ACCONTI
        ? h('button', {
          type: 'button', class: 'btn btn-secondario btn-sm acconto-aggiungi', 'data-fuoco': 'ev-acc-aggiungi',
          onClick: () => { v.acconti.push({ importo: '', data: '' }); disegnaAcconti(); },
        }, icona('plus'), h('span', {}, 'Aggiungi acconto'))
        : h('p', { class: 'campo-aiuto' }, `Puoi registrare fino a ${MAX_ACCONTI} acconti.`));
  }

  function disegnaForm() {
    disegnaCerimonia();
    disegnaAcconti();
    form.replaceChildren(
      sezione('Dati generali', 'Come si chiama l’evento e a che punto è la trattativa.',
        campo({ etichetta: 'Titolo', nome: 'titolo', valore: v.titolo, richiesto: true, errore: errori.titolo, segnaposto: 'Ad esempio Matrimonio Rossi', attributi: attr('titolo') }),
        campo({
          etichetta: 'Tipo di evento', nome: 'tipo', tipo: 'select', valore: v.tipo, opzioni: opzioniTipo,
          attributi: { 'data-fuoco': 'ev-tipo', onChange: (e) => { v.tipo = e.target.value; disegnaCerimonia(); } },
        }),
        campo({ etichetta: 'Stato', nome: 'stato', tipo: 'select', valore: v.stato, opzioni: opzioniStato, attributi: attr('stato') }),
        campo({ etichetta: 'Referente', nome: 'referente', valore: v.referente, segnaposto: 'Chi tiene i contatti', attributi: attr('referente') }),
        campo({ etichetta: 'Provenienza', nome: 'provenienza', tipo: 'select', valore: v.provenienza, opzioni: PROVENIENZE, vuota: 'Non indicata', attributi: attr('provenienza') })),
      sezione('Data e luogo', 'Quando e dove si svolge.',
        campo({ etichetta: 'Data', nome: 'data', tipo: 'date', valore: v.data, richiesto: true, errore: errori.data, attributi: attr('data') }),
        campo({ etichetta: 'Fascia', nome: 'fascia', tipo: 'select', valore: v.fascia, opzioni: FASCE, attributi: attr('fascia') }),
        campo({
          etichetta: 'Location', nome: 'locationId', tipo: 'select', valore: v.locationId, vuota: 'Da definire',
          opzioni: dati.location.map((l) => ({ valore: l.id, etichetta: `${l.nome}, ${l.citta}` })), attributi: attr('locationId'),
        }),
        campo({ etichetta: 'Invitati', nome: 'invitati', valore: v.invitati, errore: errori.invitati, segnaposto: 'Numero di persone', attributi: attr('invitati', { inputmode: 'numeric' }) })),
      sezione('Cliente', 'Chi ha richiesto l’evento.',
        campo({
          etichetta: 'Cliente', nome: 'clienteId', tipo: 'select', valore: v.clienteId, vuota: 'Nessun cliente',
          opzioni: dati.clienti.map((c) => ({ valore: c.id, etichetta: c.nome })), attributi: attr('clienteId'),
        })),
      zonaCerimonia,
      card({ titolo: 'Pagamenti', sottotitolo: 'Totale concordato e acconti già ricevuti.' },
        h('div', { class: 'form-griglia' },
          campo({ etichetta: 'Totale evento', nome: 'totale', valore: v.totale, errore: errori.totale, segnaposto: 'Ad esempio 1.500,50', aiuto: 'Facoltativo. In euro. Senza il totale non si vede il margine.', attributi: attr('totale', { inputmode: 'decimal' }) })),
        zonaAcconti),
      sezione('Note', 'Appunti interni sull’evento.',
        campo({ etichetta: 'Note', nome: 'note', tipo: 'textarea', valore: v.note, attributi: attr('note') })),
      h('div', { class: 'form-azioni' },
        modifica ? h('button', { type: 'button', class: 'btn btn-secondario btn-pericolo-testo', onClick: elimina }, icona('trash'), h('span', {}, 'Elimina evento')) : null,
        h('span', { class: 'form-azioni-spazio' }),
        h('button', { type: 'button', class: 'btn btn-secondario', onClick: () => ctx.vai(tornaA) }, 'Annulla'),
        h('button', { type: 'submit', class: 'btn btn-primario' }, modifica ? 'Salva modifiche' : 'Crea evento')));
  }

  function salva(e) {
    e.preventDefault();
    const { errori: err, campi } = valida(v);
    errori = err;
    if (Object.keys(err).length) {
      disegnaForm();
      const primo = form.querySelector('[aria-invalid="true"]');
      if (primo) primo.focus();
      return;
    }
    if (modifica) {
      ctx.aggiorna((d) => { modificaEvento(d, evento.id, campi); });
      ctx.vai(tornaA);
    } else {
      let nuovoId = null;
      ctx.aggiorna((d) => { nuovoId = creaEvento(d, campi).id; });
      ctx.segnaPasso('evento');
      ctx.vai(`#/eventi/${encodeURIComponent(nuovoId)}?sezione=cast`);
    }
  }

  async function elimina() {
    const ok = await ctx.conferma(`Vuoi eliminare «${evento.titolo}»? Spariscono anche le sue spese e non si può annullare.`, {
      titolo: 'Eliminare l’evento?', conferma: 'Elimina', pericolo: true,
    });
    if (!ok) return;
    // Prima si va all'elenco, poi si cancella: così non compare mai «Evento non trovato».
    ctx.vai('#/eventi');
    ctx.aggiorna((d) => { eliminaEvento(d, evento.id); });
  }

  form.addEventListener('submit', salva);
  disegnaForm();

  return h('div', { class: 'pagina-evento-form' },
    intestazione({
      titolo: modifica ? 'Modifica evento' : 'Nuovo evento',
      sottotitolo: modifica ? evento.titolo : 'Inserisci i dati principali. Potrai completare il resto dalla scheda.',
    }),
    form);
}
