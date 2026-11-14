// Location e Chiese viste dall'artista: solo i luoghi dei suoi eventi, senza pulsanti di modifica.
import { paginaLuoghi } from '../titolare/location.js';
import { luoghiArtista } from '../../core/aree.js';
import { ID_ARTISTA_DEMO } from '../../core/seed.js';

const lista = (ctx, tipo, conf) => {
  const righe = luoghiArtista(ctx.dati, ID_ARTISTA_DEMO, tipo);
  return paginaLuoghi(ctx, { ...conf, righe, eventiDi: (r) => r.eventi, soloVista: true });
};

export const renderLocation = (ctx) => lista(ctx, 'location', {
  titolo: 'Location', sottotitolo: 'Le location dei tuoi eventi, con l’indirizzo.',
  etichetta: 'Le tue location', colonnaNome: 'Location', vuoto: 'Non hai ancora eventi con una location.',
});

export const renderChiese = (ctx) => lista(ctx, 'chiese', {
  titolo: 'Chiese', sottotitolo: 'Le chiese dei tuoi eventi con rito religioso.',
  etichetta: 'Le tue chiese', colonnaNome: 'Chiesa', vuoto: 'Non hai ancora eventi con una chiesa.',
});
