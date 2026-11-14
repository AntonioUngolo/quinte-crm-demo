// Location: elenco in sola lettura (riusato da chiese.js e service.js).
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, tabella, bottoneSolaLettura } from '../../ui/componenti.js';

/**
 * Pagina elenco di luoghi con città e indirizzo.
 * conf: { titolo, sottotitolo, nuovo, etichetta, righe, eventiDi(riga) -> numero, vuoto, soloVista? }
 * `soloVista`: niente «Nuova» né colonna Azioni (area dell'artista).
 */
export function paginaLuoghi(ctx, conf) {
  const colonne = [
    { titolo: conf.colonnaNome || 'Nome', valore: (r) => h('span', { class: 'cella-evento-titolo' }, r.nome) },
    { titolo: 'Città', valore: (r) => r.citta || 'Non indicata' },
    { titolo: 'Indirizzo', valore: (r) => r.indirizzo || 'Non indicato' },
    { titolo: 'Eventi', valore: (r) => String(conf.eventiDi(r)), allinea: 'destra' },
  ];
  if (!conf.soloVista) {
    colonne.push({ titolo: 'Azioni', valore: () => h('div', { class: 'azioni-riga' },
      bottoneSolaLettura('Modifica', ctx, { variante: 'terziario', icona: 'pencil-simple' })) });
  }
  return h('div', { class: 'pagina-anagrafica' },
    intestazione({
      titolo: conf.titolo,
      sottotitolo: conf.sottotitolo,
      azioni: conf.soloVista ? [] : [bottoneSolaLettura(conf.nuovo, ctx, { variante: 'primario', icona: 'plus' })],
    }),
    card({ titolo: conf.etichetta, conteggio: conf.righe.length, piatto: true },
      tabella(colonne, conf.righe, { vuoto: conf.vuoto, etichetta: conf.etichetta })));
}

export function render(ctx) {
  const { dati } = ctx;
  return paginaLuoghi(ctx, {
    titolo: 'Location',
    sottotitolo: 'Le sale e le ville dove lavora l’agenzia.',
    nuovo: 'Nuova location',
    etichetta: 'Elenco location',
    righe: dati.location,
    eventiDi: (l) => dati.eventi.filter((e) => e.locationId === l.id).length,
    vuoto: 'Nessuna location in elenco.',
  });
}
