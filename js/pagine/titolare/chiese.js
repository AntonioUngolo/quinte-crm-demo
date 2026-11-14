// Chiese: elenco in sola lettura.
import { paginaLuoghi } from './location.js';

export function render(ctx) {
  const { dati } = ctx;
  return paginaLuoghi(ctx, {
    titolo: 'Chiese',
    sottotitolo: 'Le chiese collegate agli eventi con rito religioso.',
    nuovo: 'Nuova chiesa',
    etichetta: 'Elenco chiese',
    righe: dati.chiese,
    eventiDi: (c) => dati.eventi.filter((e) => e.chiesaId === c.id).length,
    vuoto: 'Nessuna chiesa in elenco.',
  });
}
