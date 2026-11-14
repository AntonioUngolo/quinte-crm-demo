// Testi fissi della demo: riquadro «Cosa stai vedendo» per pagina, titoli, popup.
// Fatti presi da sito/demo/PAGINE.md (funzioni.html). Niente trattini lunghi.

export const COSA_STAI_VEDENDO = {
  // Titolare
  dashboard: 'La pagina con cui si apre la giornata: eventi confermati, utile stimato, acconti incassati e artisti nel roster, poi i prossimi eventi, gli appuntamenti in arrivo e i clienti da richiamare.',
  eventi: 'Tutti gli eventi dell\'agenzia in un elenco unico, con data, location, invitati e stato. Tocca un evento per aprirne la scheda completa.',
  'evento-nuovo': 'Il modulo del nuovo evento: tipologia, data, fascia (pranzo o cena), invitati, location, cliente e provenienza. Chiesa e rito compaiono solo quando servono.',
  'evento-modifica': 'Qui cambi i dati dell\'evento. Nella versione completa, se sposti la data resta lo storico dei rinvii e il cast riceve un avviso.',
  'evento-scheda': 'La scheda dell\'evento raccoglie tutto in sei sezioni: Panoramica, Cast artistico, Pagamenti, Musica, Allestimento e service, Contratti. Nel cast scegli momento, cachet e dress code e vedi subito il margine stimato.',
  'evento-chat': 'Ogni evento ha la sua chat in tempo reale tra staff e cast, con il contatore dei non letti e le notifiche sul telefono. Qui vedi una conversazione di esempio.',
  archivio: 'Gli eventi completati, sospesi o cancellati restano consultabili. Un evento sospeso si riattiva con il suo motivo, uno cancellato finisce nel cestino e si può ripristinare.',
  calendario: 'Il calendario dell\'agenzia in vista mese: eventi, appuntamenti, eventi interni e assenze dello staff. Filtri per artista e vedi chi è già impegnato in una data.',
  artisti: 'L\'anagrafica degli artisti, effettivi e occasionali, con i momenti che coprono e il cachet standard. Se attivi la disponibilità, ognuno blocca le date in cui non c\'è.',
  'artista-scheda': 'La scheda dell\'artista: contatti, ruolo, momenti coperti, cachet standard e gli eventi in cui è nel cast.',
  clienti: 'I clienti dell\'agenzia con contatti e provenienza: Instagram, passaparola, location, wedding planner. Da ogni cliente arrivi ai suoi eventi e ai suoi appuntamenti.',
  'cliente-scheda': 'La scheda del cliente con contatti, provenienza, i suoi eventi e i suoi appuntamenti, tutto in un posto solo.',
  location: 'Le location dove lavora l\'agenzia, con città e indirizzo. Nella versione completa l\'indirizzo si apre direttamente su Maps.',
  chiese: 'Le chiese con città e indirizzo, da collegare agli eventi con rito religioso. Anche qui l\'indirizzo si apre su Maps.',
  appuntamenti: 'Il CRM degli appuntamenti: sopralluoghi e incontri in arrivo, i clienti da richiamare e l\'esito di ogni incontro. Dall\'appuntamento nasce l\'evento.',
  service: 'I service con referente e telefono, da assegnare all\'allestimento di ogni evento. Nella versione completa il service ha la sua area: solo logistica, niente soldi.',
  finanze: 'Finanze e spese, visibili solo al titolare: acconti, spese per evento e dell\'agenzia, margine, riepilogo mensile e spese per categoria. I movimenti si esportano in CSV.',
  opzioni: 'Le opzioni rendono l\'app tua: logo, colori e nome dell\'agenzia, liste di tipologie, stati e momenti, categorie di spesa e modelli dei contratti.',

  // Artista
  'artista-home': 'Così l\'artista vede l\'app sul telefono: incarichi da accettare, prossimi eventi e cachet dell\'anno. Vede solo ciò che lo riguarda, mai i conti dell\'agenzia.',
  'artista-eventi': 'Gli eventi in cui l\'artista è nel cast, con data, location, momento, stato dell\'incarico e il suo cachet. Il dress code lo trova aprendo l\'evento.',
  'artista-evento': 'Il dettaglio dell\'incarico: momento, cachet, dress code, location e chiesa. Nella versione completa l\'artista accetta o rifiuta da qui e il contratto si genera dal modello.',
  'artista-calendario': 'Il calendario personale dell\'artista con i suoi impegni. Se la disponibilità è attiva, qui blocca le date in cui non c\'è e lo staff le vede quando compone il cast.',
  'artista-location': 'Le location con indirizzo, così l\'artista sa dove andare senza chiedere a nessuno.',
  'artista-chiese': 'Le chiese con indirizzo, per le cerimonie religiose in cui l\'artista è nel cast.',
  'artista-profilo': 'Il profilo dell\'artista con i dati che servono per il contratto, sempre aggiornati da lui.',

  // Cliente
  'cliente-home': 'Così il cliente vede il suo evento: giorni mancanti, pagamenti, artisti, musica, contratto e privacy. Vede solo il suo evento, niente altro.',
  'cliente-evento': 'Il dettaglio dell\'evento per il cliente: pagamenti fatti e da fare, artisti, la musica da scegliere nei momenti che decidi tu e i documenti da firmare.',
  'cliente-profilo': 'Il profilo del cliente con i suoi contatti, che l\'agenzia ritrova nella scheda cliente.',
};

export const TITOLI_PAGINA = {
  dashboard: 'Dashboard',
  eventi: 'Eventi',
  'evento-nuovo': 'Nuovo evento',
  'evento-modifica': 'Modifica evento',
  'evento-scheda': 'Scheda evento',
  'evento-chat': 'Chat dell\'evento',
  archivio: 'Archivio eventi',
  calendario: 'Calendario',
  artisti: 'Artisti',
  'artista-scheda': 'Scheda artista',
  clienti: 'Clienti',
  'cliente-scheda': 'Scheda cliente',
  location: 'Location',
  chiese: 'Chiese',
  appuntamenti: 'Appuntamenti',
  service: 'Service',
  finanze: 'Finanze & Spese',
  opzioni: 'Opzioni',
  'artista-home': 'Dashboard',
  'artista-eventi': 'I miei eventi',
  'artista-evento': 'Il mio incarico',
  'artista-calendario': 'Calendario',
  'artista-location': 'Location',
  'artista-chiese': 'Chiese',
  'artista-profilo': 'Profilo',
  'cliente-home': 'I miei eventi',
  'cliente-evento': 'Il mio evento',
  'cliente-profilo': 'Profilo',
};

const TITOLI_ARCHIVIO = {
  completati: 'Eventi completati',
  sospesi: 'Eventi sospesi',
  cancellati: 'Eventi cancellati',
};

export const POPUP = {
  titolo: 'Ti è piaciuto?',
  testi: {
    fine: 'Hai fatto il giro completo: evento, cast, calendario, spese e area artista. Con Quinte CRM la tua agenzia lavora così ogni giorno, con i suoi dati e il suo logo.',
    solaLettura: 'Nella versione completa puoi farlo: in questa demo la pagina è solo da guardare. Con la prova gratuita la usi davvero, con i dati della tua agenzia.',
    barra: 'Quinte CRM mette in un posto solo eventi, cast, calendario, pagamenti e contratti della tua agenzia. Richiedi la prova gratuita o guarda i piani.',
  },
  /** Destinazioni dei pulsanti: i form del sito quintecrm.it. */
  link: {
    prova: 'https://quintecrm.it/demo/',
    acquista: 'https://quintecrm.it/contatti/',
  },
};

/** Testo del riquadro «Cosa stai vedendo», null se la pagina non ne ha. */
export function testoRiquadro(idPagina) {
  return Object.hasOwn(COSA_STAI_VEDENDO, idPagina) ? COSA_STAI_VEDENDO[idPagina] : null;
}

/** Titolo leggibile della pagina; per l'archivio dipende dallo stato. */
export function titoloPagina(idPagina, params = {}) {
  if (idPagina === 'archivio' && Object.hasOwn(TITOLI_ARCHIVIO, params.stato)) {
    return TITOLI_ARCHIVIO[params.stato];
  }
  return TITOLI_PAGINA[idPagina] || 'Quinte CRM';
}
