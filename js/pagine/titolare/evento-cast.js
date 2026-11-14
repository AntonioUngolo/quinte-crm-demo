// Cast artistico della scheda evento: elenco incarichi, aggiunta, modifica e rimozione.
import { h, icona } from '../../ui/dom.js';
import { card, tabella, badgeStato, campo, statoVuoto } from '../../ui/componenti.js';
import { apriFinestra } from '../../ui/popup.js';
import { assegnaArtista, modificaIncarico, togliArtista, trovaEvento } from '../../core/azioni.js';
import { totaleCachet, margineCast, senzaTotale } from '../../core/calcoli.js';
import { leggiImporto, euro } from '../../core/numeri.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';

const testoImporto = (n) => (n || n === 0 ? euro(n).replace('€ ', '') : '');
const nomeArtista = (dati, id) => (dati.artisti.find((a) => a.id === id) || {}).nome || 'Artista';

/** Momento di partenza: il primo momento dell'artista che esiste fra le opzioni. */
function momentoIniziale(dati, artista) {
  const opzioni = dati.opzioni.momenti;
  return (artista && artista.momenti.find((m) => opzioni.includes(m))) || opzioni[0] || '';
}

/** Campi comuni (momento, cachet, dress code); restituisce i nodi e un lettore con validazione. */
function campiIncarico(dati, iniziali) {
  let campoCachet = campo({
    etichetta: 'Cachet (€)', nome: 'cachet', valore: iniziali.cachet, richiesto: true,
    attributi: { inputmode: 'decimal', autocomplete: 'off' },
  });
  const nodi = h('div', { class: 'incarico-campi' },
    campo({ etichetta: 'Momento', nome: 'momento', tipo: 'select', valore: iniziali.momento, opzioni: dati.opzioni.momenti }),
    campoCachet,
    campo({
      etichetta: 'Dress code', nome: 'dressCode', valore: iniziali.dressCode, aiuto: 'Facoltativo',
      attributi: { autocomplete: 'off' },
    }));

  /** Legge il modulo; se il cachet non è valido mostra l'errore e restituisce null. */
  function leggi(form) {
    const el = form.elements;
    const testo = el.cachet.value;
    const valore = leggiImporto(testo);
    if (valore === null) {
      const nuovo = campo({
        etichetta: 'Cachet (€)', nome: 'cachet', valore: testo, richiesto: true,
        errore: 'Scrivi un importo valido, ad esempio 600 o 1.500,50.',
        attributi: { inputmode: 'decimal', autocomplete: 'off' },
      });
      campoCachet.replaceWith(nuovo);
      campoCachet = nuovo;
      nuovo.querySelector('[name="cachet"]').focus();
      return null;
    }
    return { momento: el.momento.value, cachet: valore, dressCode: el.dressCode.value.trim() };
  }
  return { nodi, leggi };
}

function finestraAggiungi(ctx, evento) {
  const { dati } = ctx;
  const demo = dati.artisti.find((a) => a.id === ID_ARTISTA_DEMO);
  const nomeDemo = demo ? demo.nome : 'l’artista della demo';
  const { nodi, leggi } = campiIncarico(dati, {
    momento: momentoIniziale(dati, demo), cachet: demo ? testoImporto(demo.cachetStandard) : '', dressCode: '',
  });

  const roster = dati.artisti.map((a) => {
    const attivo = a.id === ID_ARTISTA_DEMO;
    const id = `artista-${a.id}`;
    return h('label', { class: ['opzione-artista', attivo ? null : 'opzione-artista--spenta'], for: id },
      h('input', { type: 'radio', name: 'artistaId', id, value: a.id, checked: attivo, disabled: !attivo, 'data-autofocus': attivo ? '' : null }),
      h('span', { class: 'opzione-artista-testi' },
        h('span', { class: 'opzione-artista-nome' }, a.nome),
        h('span', { class: 'opzione-artista-sotto' }, `${a.ruolo} · ${a.tipo} · cachet standard ${euro(a.cachetStandard)}`),
        attivo ? null : h('span', { class: 'opzione-artista-nota' }, `Nella demo puoi assegnare solo ${nomeDemo}`)));
  });

  apriFinestra({
    titolo: 'Aggiungi artista al cast',
    classe: 'finestra--larga',
    corpo: h('div', { class: 'incarico-form' },
      h('p', { class: 'incarico-intro' }, 'Scegli l’artista, il momento dell’evento e il cachet. Il cachet diventa anche una spesa dell’evento.'),
      h('fieldset', { class: 'roster' },
        h('legend', { class: 'campo-etichetta' }, 'Artista'),
        h('div', { class: 'roster-elenco' }, roster)),
      nodi),
    azioni: [
      { etichetta: 'Annulla', variante: 'secondario' },
      { etichetta: 'Aggiungi al cast', variante: 'primario', tipo: 'submit' },
    ],
    suInvio: (e, chiudi) => {
      const campi = leggi(e.currentTarget);
      if (!campi) return;
      chiudi();
      let esito = false;
      ctx.aggiorna((d) => { esito = assegnaArtista(d, evento.id, { artistaId: ID_ARTISTA_DEMO, ...campi }); });
      if (esito) ctx.segnaPasso('cast');
    },
  });
}

function finestraModifica(ctx, evento, inc) {
  const { dati } = ctx;
  const nome = nomeArtista(dati, inc.artistaId);
  const { nodi, leggi } = campiIncarico(dati, {
    momento: inc.momento, cachet: testoImporto(inc.cachet), dressCode: inc.dressCode || '',
  });
  apriFinestra({
    titolo: `Modifica incarico di ${nome}`,
    corpo: h('div', { class: 'incarico-form' },
      h('p', { class: 'incarico-intro' }, 'Se cambi il cachet si aggiorna anche la spesa dell’evento.'),
      nodi),
    azioni: [
      { etichetta: 'Annulla', variante: 'secondario' },
      { etichetta: 'Salva modifiche', variante: 'primario', tipo: 'submit' },
    ],
    suInvio: (e, chiudi) => {
      const campi = leggi(e.currentTarget);
      if (!campi) return;
      chiudi();
      ctx.aggiorna((d) => { modificaIncarico(d, evento.id, inc.artistaId, campi); });
    },
  });
}

function finestraGiaNelCast(ctx, evento, inc) {
  const nome = nomeArtista(ctx.dati, inc.artistaId);
  apriFinestra({
    titolo: 'Artista già nel cast',
    corpo: `Nella demo puoi assegnare solo ${nome}, ed è già nel cast di questo evento. Puoi modificarne momento, cachet o dress code.`,
    azioni: [
      { etichetta: 'Chiudi', variante: 'secondario' },
      { etichetta: 'Modifica incarico', variante: 'primario', azione: (chiudi) => { chiudi(); finestraModifica(ctx, evento, inc); } },
    ],
  });
}

async function rimuovi(ctx, evento, inc) {
  const nome = nomeArtista(ctx.dati, inc.artistaId);
  const ok = await ctx.conferma(
    `Vuoi togliere ${nome} dal cast di «${evento.titolo}»? Sparisce anche la sua spesa «Cachet · ${nome}».`,
    { titolo: 'Rimuovere dal cast?', conferma: 'Rimuovi', pericolo: true },
  );
  if (!ok) return;
  ctx.aggiorna((d) => { togliArtista(d, evento.id, inc.artistaId); });
  queueMicrotask(() => document.querySelector('[data-fuoco="cast-aggiungi"]')?.focus());
}

export function disegnaCast(ctx, evento) {
  const { dati } = ctx;
  const cast = evento.cast || [];
  const demoInCast = cast.find((c) => c.artistaId === ID_ARTISTA_DEMO);

  const aggiungi = h('button', {
    type: 'button', class: 'btn btn-primario', 'data-fuoco': 'cast-aggiungi',
    onClick: () => {
      const corrente = trovaEvento(ctx.dati, evento.id);
      if (!corrente) return;
      const inc = (corrente.cast || []).find((c) => c.artistaId === ID_ARTISTA_DEMO);
      if (inc) finestraGiaNelCast(ctx, corrente, inc);
      else finestraAggiungi(ctx, corrente);
    },
  }, icona('plus'), h('span', {}, 'Aggiungi artista'));

  const colonne = [
    {
      titolo: 'Artista',
      valore: (c) => {
        const a = dati.artisti.find((x) => x.id === c.artistaId);
        return h('div', { class: 'cella-evento' },
          h('span', { class: 'cella-evento-titolo' }, a ? a.nome : 'Artista'),
          h('span', { class: 'cella-evento-sotto' }, a ? a.ruolo : ''));
      },
    },
    { titolo: 'Momento', valore: (c) => c.momento || 'Da definire' },
    { titolo: 'Cachet', valore: (c) => euro(c.cachet), allinea: 'destra' },
    { titolo: 'Dress code', valore: (c) => c.dressCode || 'Non impostato' },
    { titolo: 'Stato', valore: (c) => badgeStato(c.statoIncarico || 'In attesa') },
    {
      titolo: 'Azioni',
      valore: (c) => h('div', { class: 'azioni-riga' },
        h('button', {
          type: 'button', class: 'btn btn-secondario btn-sm', 'data-fuoco': `cast-modifica-${c.artistaId}`,
          'aria-label': `Modifica incarico di ${nomeArtista(dati, c.artistaId)}`,
          onClick: () => finestraModifica(ctx, evento, c),
        }, icona('pencil-simple'), h('span', {}, 'Modifica')),
        h('button', {
          type: 'button', class: 'btn btn-secondario btn-sm btn-pericolo-testo', 'data-fuoco': `cast-rimuovi-${c.artistaId}`,
          'aria-label': `Rimuovi ${nomeArtista(dati, c.artistaId)} dal cast`,
          onClick: () => rimuovi(ctx, evento, c),
        }, icona('trash'), h('span', {}, 'Rimuovi'))),
    },
  ];

  const tot = totaleCachet(evento);
  const margine = margineCast(evento);
  const riepilogo = h('div', { class: 'riepilogo-cast' },
    h('div', { class: 'riepilogo-voce' },
      h('span', { class: 'riepilogo-etichetta' }, 'Totale cachet'),
      h('strong', { class: 'riepilogo-valore' }, euro(tot))),
    senzaTotale(evento)
      ? h('div', { class: 'riepilogo-voce' },
        h('span', { class: 'riepilogo-etichetta' }, 'Margine stimato'),
        h('span', { class: 'riepilogo-nota', 'data-fuoco': 'cast-senza-totale' },
          'Inserisci il totale dell’evento per vedere il margine. ',
          h('a', { class: 'link-testo', href: `#/eventi/${encodeURIComponent(evento.id)}/modifica` }, 'Modifica l’evento')))
      : h('div', { class: 'riepilogo-voce' },
        h('span', { class: 'riepilogo-etichetta' }, 'Margine stimato'),
        h('strong', { class: ['riepilogo-valore', margine < 0 ? 'riepilogo-valore--negativo' : null] }, euro(margine)),
        h('span', { class: 'riepilogo-nota' }, 'Totale dell’evento meno i cachet del cast.')));

  return h('div', { class: 'scheda-sezione' },
    card({
      titolo: 'Cast artistico', conteggio: cast.length, piatto: true,
      sottotitolo: demoInCast ? 'Gli artisti assegnati a questo evento, con momento e cachet.' : 'Aggiungi gli artisti per ogni momento dell’evento.',
      azioni: [aggiungi],
    },
    cast.length
      ? tabella(colonne, cast, { etichetta: 'Cast dell’evento' })
      : statoVuoto('Nessun artista nel cast. Aggiungi l’artista della demo con «Aggiungi artista».', 'users-three')),
    card(null, riepilogo));
}
