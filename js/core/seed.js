// Dati di esempio della demo. Tutto inventato; le date sono offset da «oggi».
import { aggiungiGiorni } from './date.js';

export const ID_ARTISTA_DEMO = 'a-demo';
export const ID_CLIENTE_DEMO = 'c-demo';

const TIPI = ['Matrimonio', 'Cerimonia', 'Festa privata', 'Aziendale'];
const STATI = ['Da ricontattare', 'In opzione', 'In trattativa', 'Confermato'];
const MOMENTI = ['Cerimonia', 'Aperitivo', 'Sala'];
const CATEGORIE_SPESE = ['Allestimento', 'Trasporto', 'SIAE', 'Stampa', 'Fitto', 'Utenze', 'Commercialista', 'Altro'];

// ---- Tabelle di base -------------------------------------------------------

// [id, nome, ruolo, tipo, momenti, cachetStandard]
const ARTISTI = [
  [ID_ARTISTA_DEMO, 'Chiara Valentini', 'Cantante', 'Effettivo', ['Cerimonia', 'Aperitivo', 'Sala'], 600],
  ['a1', 'Matteo Ferrante', 'Violino', 'Effettivo', ['Cerimonia', 'Aperitivo'], 450],
  ['a2', 'Luca Bernardi', 'Sassofono', 'Effettivo', ['Aperitivo', 'Sala'], 400],
  ['a3', 'Nico Sartori', 'DJ', 'Effettivo', ['Sala'], 700],
  ['a4', 'Quartetto Aurora', 'Quartetto d\'archi', 'Effettivo', ['Cerimonia', 'Aperitivo'], 900],
  ['a5', 'I Cortile Blu', 'Band', 'Effettivo', ['Sala'], 1400],
  ['a6', 'Elena Rizzo', 'Pianoforte', 'Effettivo', ['Cerimonia', 'Aperitivo'], 380],
  ['a7', 'Sofia Landi', 'Arpa', 'Occasionale', ['Cerimonia'], 420],
  ['a8', 'Paolo Greco', 'Tecnico audio', 'Effettivo', ['Cerimonia', 'Aperitivo', 'Sala'], 250],
  ['a9', 'Marta Colombo', 'Cantante', 'Occasionale', ['Cerimonia', 'Sala'], 550],
  ['a10', 'Davide Fontana', 'Chitarra', 'Occasionale', ['Aperitivo'], 300],
  ['a11', 'Irene Vitale', 'Flauto', 'Occasionale', ['Cerimonia'], 280],
  ['a12', 'Andrea Mancini', 'Fisarmonica', 'Occasionale', ['Aperitivo', 'Sala'], 320],
  ['a13', 'Trio Brezza', 'Trio jazz', 'Effettivo', ['Aperitivo', 'Sala'], 1100],
];

// [id, nome, provenienza]
const CLIENTI = [
  [ID_CLIENTE_DEMO, 'Francesca Moretti e Andrea Sala', 'Instagram'],
  ['c1', 'Giorgia Pellegrini e Tommaso Riva', 'Passaparola'],
  ['c2', 'Elisa Conti e Marco Testa', 'Location'],
  ['c3', 'Studio Legale Ferri e Associati', 'Diretto'],
  ['c4', 'Famiglia Donati', 'Passaparola'],
  ['c5', 'Valentina Orlando e Simone Gatti', 'Wedding planner'],
  ['c6', 'Cantina Valmora', 'Diretto'],
  ['c7', 'Ilaria Basile e Federico Neri', 'Instagram'],
  ['c8', 'Famiglia Zanetti', 'Passaparola'],
  ['c9', 'Beatrice Longo e Pietro Amato', 'Wedding planner'],
];

const LOCATION = [
  ['l1', 'Villa dei Cedri', 'Bergamo', 'Via dei Cedri 12'],
  ['l2', 'Tenuta Monteverde', 'Siena', 'Strada del Poggio 5'],
  ['l3', 'Castello di Rivalta', 'Piacenza', 'Via Castello 1'],
  ['l4', 'Borgo dei Limoni', 'Salerno', 'Via Lungomare 88'],
  ['l5', 'Hotel Parco del Lago', 'Como', 'Viale dei Tigli 20'],
  ['l6', 'Cascina Sant\'Aurelio', 'Verona', 'Via dei Fienili 3'],
];

const CHIESE = [
  ['ch1', 'Chiesa di San Giorgio', 'Bergamo', 'Piazza San Giorgio 2'],
  ['ch2', 'Pieve di Santa Lucia', 'Siena', 'Via della Pieve 9'],
  ['ch3', 'Chiesa della Natività', 'Salerno', 'Largo Natività 4'],
  ['ch4', 'Santuario della Madonna del Lago', 'Como', 'Via del Santuario 7'],
];

const SERVICE = [
  ['sv1', 'Luci e Suoni Nord', 'Roberto Pozzi', '+39 333 000 0201'],
  ['sv2', 'Stage Eventi', 'Silvia Farina', '+39 333 000 0202'],
  ['sv3', 'AudioPro Service', 'Gianni Barone', '+39 333 000 0203'],
];

// ---- Eventi ----------------------------------------------------------------

const inc = (artistaId, momento, cachet, stato = 'Accettato', dressCode = 'Abito scuro') =>
  ({ artistaId, momento, cachet, dressCode, statoIncarico: stato });
const brani = (momento, ...b) => ({ momento, brani: b });
const doc = (tipo, stato) => ({ tipo, stato });

// Ogni riga: offset in giorni da oggi + i campi dell'evento (il resto ha valori di base).
const EVENTI = [
  { id: 'e1', off: 5, titolo: 'Cena di fine anno Ferri e Associati', tipo: 'Aziendale', stato: 'Confermato', fascia: 'Cena', invitati: 80, locationId: 'l5', clienteId: 'c3', provenienza: 'Diretto', referente: 'Dott.ssa Ferri', totale: 4800, acconti: [[2400, -30]], serviceId: 'sv1', note: 'Musica di sottofondo e brindisi finale.',
    cast: [inc('a13', 'Sala', 1100)], musica: [brani('Sala', 'Fly Me to the Moon', 'Misty', 'La vie en rose')], contratti: [doc('Contratto cliente', 'Firmato'), doc('Contratto artisti', 'Firmato')] },
  { id: 'e2', off: 21, titolo: 'Compleanno 50 anni di Luisa Donati', tipo: 'Festa privata', stato: 'Confermato', fascia: 'Cena', invitati: 60, locationId: 'l6', clienteId: 'c4', provenienza: 'Passaparola', referente: 'Luisa Donati', totale: 3600, acconti: [[1000, -20]], serviceId: 'sv2', siae: true,
    cast: [inc('a3', 'Sala', 700), inc('a2', 'Aperitivo', 400)], musica: [brani('Aperitivo', 'Take Five', 'Girl from Ipanema')], contratti: [doc('Contratto cliente', 'Firmato')] },
  { id: 'e3', off: 40, titolo: 'Matrimonio Pellegrini Riva', tipo: 'Matrimonio', stato: 'In trattativa', fascia: 'Pranzo', invitati: 110, locationId: 'l1', chiesaId: 'ch1', rito: 'Religioso', clienteId: 'c1', provenienza: 'Passaparola', referente: 'Giorgia Pellegrini', totale: 8500, acconti: [],
    cast: [inc('a1', 'Cerimonia', 450, 'In attesa'), inc('a5', 'Sala', 1400, 'In attesa')] },
  { id: 'e4', off: 62, titolo: 'Matrimonio Conti Testa', tipo: 'Matrimonio', stato: 'Confermato', fascia: 'Pranzo', invitati: 130, locationId: 'l2', chiesaId: 'ch2', rito: 'Religioso', clienteId: 'c2', provenienza: 'Location', referente: 'Elisa Conti', totale: 9800, acconti: [[3000, -45], [2000, -10]], serviceId: 'sv3', siae: true,
    note: 'Ingresso sposi con brano scelto dagli sposi.',
    cast: [inc(ID_ARTISTA_DEMO, 'Cerimonia', 600, 'Accettato', 'Abito lungo chiaro'), inc('a4', 'Aperitivo', 900), inc('a3', 'Sala', 700)],
    musica: [brani('Cerimonia', 'Ave Maria', 'Canon in D', 'Marcia nuziale'), brani('Aperitivo', 'Perfect', 'Can\'t Help Falling in Love')],
    contratti: [doc('Contratto cliente', 'Firmato'), doc('Contratto artisti', 'Da firmare')] },
  { id: 'e5', off: 85, titolo: 'Cerimonia Orlando Gatti', tipo: 'Cerimonia', stato: 'Confermato', fascia: 'Pranzo', invitati: 45, locationId: 'l4', chiesaId: 'ch3', rito: 'Religioso', clienteId: 'c5', provenienza: 'Wedding planner', referente: 'Valentina Orlando', totale: 2900, acconti: [[900, -15]],
    cast: [inc('a7', 'Cerimonia', 420), inc('a11', 'Cerimonia', 280)],
    musica: [brani('Cerimonia', 'Ave Maria di Schubert', 'Jesu, Joy of Man\'s Desiring')], contratti: [doc('Contratto cliente', 'Firmato')] },
  { id: 'e6', off: 100, titolo: 'Matrimonio Basile Neri', tipo: 'Matrimonio', stato: 'In opzione', fascia: 'Cena', invitati: 90, locationId: 'l3', clienteId: 'c7', rito: 'Civile', provenienza: 'Instagram', referente: 'Ilaria Basile', totale: 7200, acconti: [], note: 'Data in opzione fino a fine mese.',
    storicoDate: [[-30, 'Data richiesta inizialmente un mese prima, la location era occupata']],
    cast: [inc('a6', 'Aperitivo', 380, 'In attesa')] },
  { id: 'e7', off: 118, titolo: 'Matrimonio Moretti Sala', tipo: 'Matrimonio', stato: 'Confermato', fascia: 'Pranzo', invitati: 100, locationId: 'l1', chiesaId: 'ch1', rito: 'Religioso', clienteId: ID_CLIENTE_DEMO, provenienza: 'Instagram', referente: 'Francesca Moretti', totale: 7600, acconti: [[2500, -25]], serviceId: 'sv1', siae: true,
    note: 'Gli sposi vogliono un aperitivo in giardino con musica dal vivo.',
    cast: [inc(ID_ARTISTA_DEMO, 'Aperitivo', 600, 'In attesa', 'Abito elegante colori chiari'), inc('a1', 'Cerimonia', 450), inc('a2', 'Sala', 400)],
    musica: [brani('Cerimonia', 'Ave Maria', 'Hallelujah'), brani('Aperitivo', 'La vita e bella', 'Bésame mucho'), brani('Sala', 'Primo ballo: Perfect')],
    contratti: [doc('Contratto cliente', 'Firmato'), doc('Contratto artisti', 'Da firmare'), doc('Liberatoria SIAE', 'Inviato')] },
  { id: 'e8', off: 135, titolo: 'Matrimonio Longo Amato', tipo: 'Matrimonio', stato: 'Da ricontattare', fascia: 'Pranzo', invitati: 120, locationId: 'l2', clienteId: 'c9', provenienza: 'Wedding planner', referente: 'Beatrice Longo', totale: 0, acconti: [], note: 'Primo contatto dalla wedding planner, da richiamare.' },
  { id: 'e9', off: 150, titolo: 'Festa dei 18 anni di Matilde Zanetti', tipo: 'Festa privata', stato: 'In opzione', fascia: 'Cena', invitati: 70, locationId: 'l5', clienteId: 'c8', provenienza: 'Passaparola', referente: 'Paolo Zanetti', totale: 3200, acconti: [],
    cast: [inc('a3', 'Sala', 700, 'In attesa')] },
  { id: 'e10', off: 165, titolo: 'Matrimonio sul mare Orlando', tipo: 'Matrimonio', stato: 'In trattativa', fascia: 'Cena', invitati: 140, locationId: 'l4', chiesaId: 'ch3', rito: 'Religioso', clienteId: 'c5', provenienza: 'Wedding planner', referente: 'Valentina Orlando', totale: 11500, acconti: [],
    cast: [inc('a13', 'Aperitivo', 1100, 'In attesa'), inc('a5', 'Sala', 1400, 'In attesa')] },
  { id: 'e11', off: 175, titolo: 'Presentazione vini Cantina Valmora', tipo: 'Aziendale', stato: 'Confermato', fascia: 'Pranzo', invitati: 50, locationId: 'l6', clienteId: 'c6', provenienza: 'Diretto', referente: 'Ufficio eventi Valmora', totale: 2600, acconti: [[800, -5]], serviceId: 'sv2',
    cast: [inc('a10', 'Aperitivo', 300), inc('a12', 'Aperitivo', 320)], musica: [brani('Aperitivo', 'Volare', 'Estate')], contratti: [doc('Contratto cliente', 'Firmato')] },
  { id: 'e12', off: 182, titolo: 'Matrimonio Pellegrini cugini', tipo: 'Matrimonio', stato: 'Da ricontattare', fascia: 'Pranzo', invitati: 95, locationId: 'l1', clienteId: 'c1', rito: 'Civile', provenienza: 'Passaparola', referente: 'Giorgia Pellegrini', totale: 0, acconti: [] },
  // Archivi: sospeso e cancellato
  { id: 'e13', off: 70, titolo: 'Anniversario di nozze Donati', tipo: 'Festa privata', stato: 'Sospeso', fascia: 'Cena', invitati: 40, locationId: 'l6', clienteId: 'c4', provenienza: 'Passaparola', referente: 'Luisa Donati', totale: 2200, acconti: [[500, -12]], note: 'Sospeso in attesa che la famiglia confermi la data.' },
  { id: 'e14', off: 90, titolo: 'Brindisi aziendale di primavera', tipo: 'Aziendale', stato: 'Cancellato', fascia: 'Pranzo', invitati: 35, locationId: 'l5', clienteId: 'c3', provenienza: 'Diretto', referente: 'Dott.ssa Ferri', totale: 1800, acconti: [], note: 'Annullato dal cliente.' },
  // Completati
  { id: 'e15', off: -20, titolo: 'Matrimonio Gatti Orlando', tipo: 'Matrimonio', stato: 'Completato', fascia: 'Pranzo', invitati: 105, locationId: 'l3', chiesaId: 'ch4', rito: 'Religioso', clienteId: 'c5', provenienza: 'Wedding planner', referente: 'Valentina Orlando', totale: 8900, acconti: [[3000, -140], [3000, -60], [2900, -21]], serviceId: 'sv3', siae: true,
    cast: [inc('a4', 'Cerimonia', 900), inc('a13', 'Aperitivo', 1100), inc('a3', 'Sala', 700)], musica: [brani('Cerimonia', 'Canon in D')], contratti: [doc('Contratto cliente', 'Firmato'), doc('Contratto artisti', 'Firmato')] },
  { id: 'e16', off: -55, titolo: 'Festa di laurea Riva', tipo: 'Festa privata', stato: 'Completato', fascia: 'Cena', invitati: 55, locationId: 'l5', clienteId: 'c1', provenienza: 'Passaparola', referente: 'Tommaso Riva', totale: 2400, acconti: [[1200, -80], [1200, -56]],
    cast: [inc('a3', 'Sala', 700), inc('a12', 'Aperitivo', 320)], musica: [brani('Sala', 'Playlist concordata')], contratti: [doc('Contratto cliente', 'Firmato')] },
  { id: 'e17', off: -120, titolo: 'Matrimonio figlia Zanetti', tipo: 'Matrimonio', stato: 'Completato', fascia: 'Pranzo', invitati: 150, locationId: 'l2', chiesaId: 'ch2', rito: 'Religioso', clienteId: 'c8', provenienza: 'Passaparola', referente: 'Paolo Zanetti', totale: 10200, acconti: [[3500, -250], [3500, -170], [3200, -125]], serviceId: 'sv1', siae: true,
    cast: [inc('a6', 'Cerimonia', 380), inc('a1', 'Cerimonia', 450), inc('a5', 'Sala', 1400)], musica: [brani('Cerimonia', 'Ave Maria')], contratti: [doc('Contratto cliente', 'Firmato'), doc('Contratto artisti', 'Firmato')] },
];

function creaEventi(oggi) {
  const d = (n) => aggiungiGiorni(oggi, n);
  return EVENTI.map((e) => ({
    id: e.id,
    titolo: e.titolo,
    tipo: e.tipo,
    stato: e.stato,
    data: d(e.off),
    fascia: e.fascia,
    invitati: e.invitati,
    locationId: e.locationId,
    chiesaId: e.chiesaId ?? null,
    rito: e.rito ?? null,
    clienteId: e.clienteId,
    provenienza: e.provenienza,
    referente: e.referente,
    siae: Boolean(e.siae),
    totale: e.totale,
    acconti: e.acconti.map(([importo, giorni]) => ({ importo, data: d(e.off + giorni) })),
    note: e.note ?? '',
    cast: e.cast ?? [],
    musica: e.musica ?? [],
    allestimento: { serviceId: e.serviceId ?? null, note: e.serviceId ? 'Palco, impianto audio e luci come da preventivo.' : '' },
    contratti: e.contratti ?? [],
    storicoDate: (e.storicoDate ?? []).map(([giorni, motivo]) => ({ data: d(e.off + giorni), motivo })),
    daUtente: false,
  }));
}

// ---- Altre liste -----------------------------------------------------------

// [giorni da oggi, voce, categoria, importo, eventoId|null]
const SPESE_MANUALI = [
  [-95, 'Fitto sala prove, trimestre', 'Fitto', 450, null],
  [-80, 'Stampa brochure e biglietti da visita', 'Stampa', 160, null],
  [-70, 'Bolletta luce e internet ufficio', 'Utenze', 135, null],
  [-62, 'Consulenza commercialista, trimestre', 'Commercialista', 380, null],
  [-48, 'Trasporto strumenti, matrimonio figlia Zanetti', 'Trasporto', 220, 'e17'],
  [-130, 'Allestimento floreale, matrimonio figlia Zanetti', 'Allestimento', 650, 'e17'],
  [-125, 'Diritti SIAE, matrimonio figlia Zanetti', 'SIAE', 310, 'e17'],
  [-58, 'Stampa libretti messa', 'Stampa', 90, 'e15'],
  [-24, 'Diritti SIAE, matrimonio Gatti Orlando', 'SIAE', 280, 'e15'],
  [-21, 'Noleggio furgone', 'Trasporto', 140, 'e15'],
  [-57, 'Noleggio casse per la festa di laurea', 'Altro', 120, 'e16'],
  [-40, 'Bolletta luce e internet ufficio', 'Utenze', 140, null],
  [-30, 'Fitto sala prove, trimestre', 'Fitto', 450, null],
  [-15, 'Consulenza commercialista, trimestre', 'Commercialista', 380, null],
  [-8, 'Stampa preventivi e contratti', 'Stampa', 75, null],
  [-3, 'Trasporto strumenti, sopralluogo', 'Trasporto', 60, null],
  [2, 'Allestimento luci, cena Ferri e Associati', 'Allestimento', 300, 'e1'],
  [10, 'Diritti SIAE, compleanno Donati', 'SIAE', 150, 'e2'],
  [30, 'Allestimento palco, matrimonio Conti Testa', 'Allestimento', 520, 'e4'],
  [45, 'Diritti SIAE, matrimonio Conti Testa', 'SIAE', 290, 'e4'],
  [60, 'Altro: cancelleria e piccole spese', 'Altro', 55, null],
];

// [id, titolo, giorni, ora, tipo, clienteNome, conChi, daRichiamare, esito, durata in minuti]
const APPUNTAMENTI = [
  ['p1', 'Sopralluogo Villa dei Cedri', 6, '10:30', 'Sopralluogo', 'Francesca Moretti e Andrea Sala', 'Gli sposi', false, '', 90],
  ['p2', 'Telefonata di preventivo', 2, '15:00', 'Telefonata', 'Giorgia Pellegrini e Tommaso Riva', 'Giorgia', true, '', 30],
  ['p3', 'Incontro per la scaletta musicale', 9, '17:30', 'Incontro', 'Elisa Conti e Marco Testa', 'Elisa e Marco', false, '', 60],
  ['p4', 'Richiamare la wedding planner', 1, '11:00', 'Telefonata', 'Beatrice Longo e Pietro Amato', 'Wedding planner', true, '', 30],
  ['p5', 'Prova audio in sala', 13, '16:00', 'Sopralluogo', 'Studio Legale Ferri e Associati', 'Referente della location', false, '', 90],
  ['p6', 'Conferma data', 3, '12:00', 'Telefonata', 'Famiglia Zanetti', 'Paolo Zanetti', true, '', 30],
  ['p7', 'Incontro di presentazione', -4, '18:00', 'Incontro', 'Ilaria Basile e Federico Neri', 'Gli sposi', false, 'Hanno chiesto di tenere la data in opzione', 60],
  ['p8', 'Telefonata di ringraziamento', -9, '09:30', 'Telefonata', 'Valentina Orlando e Simone Gatti', 'Valentina', false, 'Contenti, ci consigliano a due amiche', 30],
];

// [id, tipo, titolo, giorni, giorniFine, persona, ora, oraFine]
const AGENDA = [
  ['g1', 'Interno', 'Riunione di squadra', 4, 4, 'Tutto lo staff', '09:30', '11:00'],
  ['g2', 'Interno', 'Aggiornamento listino', 13, 13, 'Amministrazione', '15:00', '16:30'],
  ['g3', 'Assenza', 'Ferie', 20, 27, 'Matteo Ferrante'],
  ['g4', 'Assenza', 'Impegno personale', 8, 8, 'Paolo Greco'],
];

// [eventoId, [[autore, ruolo, testo, giorni, ora]]]
const CHAT = [
  ['e4', [
    ['Elisa Conti', 'cliente', 'Buongiorno, possiamo aggiungere un brano all\'uscita dalla chiesa?', -6, '10:12'],
    ['Studio', 'titolare', 'Certo, mandateci il titolo e lo inseriamo in scaletta.', -6, '10:40'],
    ['Chiara Valentini', 'artista', 'Per me va bene, lo provo anche prima del matrimonio.', -5, '18:05'],
  ]],
  ['e7', [
    ['Studio', 'titolare', 'Ciao Francesca, ti abbiamo inviato il programma della giornata.', -3, '09:15'],
    ['Francesca Moretti', 'cliente', 'Grazie! Possiamo parlare dell\'aperitivo in giardino?', -3, '11:02'],
    ['Studio', 'titolare', 'Sì, ci sentiamo domani alle 15 per i dettagli.', -2, '08:50'],
  ]],
];

// ---- Costruzione -----------------------------------------------------------

function creaSpese(oggi, eventi, artisti) {
  const d = (n) => aggiungiGiorni(oggi, n);
  const nomi = new Map(artisti.map((a) => [a.id, a.nome]));
  const manuali = SPESE_MANUALI.map(([giorni, voce, categoria, importo, eventoId], i) => ({
    id: `s${i + 1}`, data: d(giorni), voce, categoria, importo, eventoId, origine: 'manuale', artistaId: null,
  }));
  const cachet = eventi.flatMap((e) => e.cast.map((c) => ({
    id: `sc-${e.id}-${c.artistaId}`, data: e.data, voce: 'Cachet · ' + nomi.get(c.artistaId),
    categoria: 'Cachet', importo: c.cachet, eventoId: e.id, origine: 'cachet', artistaId: c.artistaId,
  })));
  return [...manuali, ...cachet];
}

/** Ogni chiamata restituisce un grafo indipendente: le costanti del modulo non vengono mai condivise. */
export function creaDatiEsempio(oggi) {
  return structuredClone(costruisciDati(oggi));
}

function costruisciDati(oggi) {
  const d = (n) => aggiungiGiorni(oggi, n);
  const contatto = (i) => `+39 333 000 ${String(1000 + i).slice(-4)}`;
  const artisti = ARTISTI.map(([id, nome, ruolo, tipo, momenti, cachetStandard], i) => ({
    id, nome, ruolo, tipo, momenti, cachetStandard,
    telefono: contatto(100 + i),
    email: `${nome.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@esempio.it`,
    demo: id === ID_ARTISTA_DEMO,
    dateBloccate: id === 'a1' ? [d(20), d(21), d(22)] : [],
  }));
  const eventi = creaEventi(oggi);
  return {
    versione: 1,
    agenzia: '',
    ruolo: 'titolare',
    guida: { aperta: true, fatti: [], finita: false },
    riquadriChiusi: [],
    eventi,
    artisti,
    clienti: CLIENTI.map(([id, nome, provenienza], i) => ({
      id, nome, telefono: contatto(300 + i), email: `contatto${i + 1}@esempio.it`, provenienza, demo: id === ID_CLIENTE_DEMO,
    })),
    location: LOCATION.map(([id, nome, citta, indirizzo]) => ({ id, nome, citta, indirizzo })),
    chiese: CHIESE.map(([id, nome, citta, indirizzo]) => ({ id, nome, citta, indirizzo })),
    service: SERVICE.map(([id, nome, referente, telefono]) => ({ id, nome, referente, telefono })),
    appuntamenti: APPUNTAMENTI.map(([id, titolo, giorni, ora, tipo, clienteNome, conChi, daRichiamare, esito, durata]) => (
      { id, titolo, data: d(giorni), ora, durata, tipo, clienteNome, conChi, daRichiamare, esito })),
    agenda: AGENDA.map(([id, tipo, titolo, giorni, fine, persona, ora = '', oraFine = '']) => (
      { id, tipo, titolo, data: d(giorni), dataFine: d(fine), persona, ora, oraFine })),
    spese: creaSpese(oggi, eventi, artisti),
    chat: CHAT.map(([eventoId, messaggi]) => ({
      eventoId,
      messaggi: messaggi.map(([autore, ruolo, testo, giorni, ora]) => ({ autore, ruolo, testo, ora: `${d(giorni)}T${ora}` })),
    })),
    opzioni: { tipi: [...TIPI], stati: [...STATI], momenti: [...MOMENTI], categorieSpese: [...CATEGORIE_SPESE] },
  };
}
