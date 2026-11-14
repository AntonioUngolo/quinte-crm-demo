// Chat dell'evento: conversazione di esempio, scrittura disattivata.
import { h, icona } from '../../ui/dom.js';
import { intestazione, card, statoVuoto } from '../../ui/componenti.js';
import { formatoBreve } from '../../core/date.js';

const oraBreve = (ora) => {
  const [giorno, hh] = String(ora || '').split('T');
  return giorno && hh ? `${formatoBreve(giorno)} ${hh}` : '';
};

export function render(ctx) {
  const { dati, params } = ctx;
  const evento = dati.eventi.find((e) => e.id === params.id);
  if (!evento) {
    return h('div', {}, intestazione({ titolo: 'Chat dell’evento' }),
      card(null, statoVuoto('Questo evento non esiste più, quindi non c’è nessuna chat da mostrare.', 'chat-circle')),
      h('p', {}, h('a', { class: 'link-testo', href: '#/eventi' }, 'Torna agli eventi')));
  }
  const conversazione = dati.chat.find((c) => c.eventoId === evento.id);
  const messaggi = conversazione ? conversazione.messaggi : [];

  const elenco = messaggi.length
    ? h('ol', { class: 'chat-elenco', 'aria-label': 'Messaggi della chat' }, messaggi.map((m) =>
      h('li', { class: ['chat-messaggio', m.ruolo === 'titolare' ? 'chat-messaggio--staff' : null] },
        h('div', { class: 'chat-fumetto' },
          h('p', { class: 'chat-autore' }, m.autore, h('span', { class: 'chat-ruolo' }, m.ruolo)),
          h('p', { class: 'chat-testo' }, m.testo),
          h('p', { class: 'chat-ora' }, oraBreve(m.ora))))))
    : statoVuoto('Nessun messaggio in questa chat. Nella versione completa qui scrivono staff e cast.', 'chat-circle');

  const apri = () => ctx.apriPopup('solaLettura');
  const barra = h('div', { class: 'chat-barra', onClick: apri },
    h('input', {
      type: 'text', class: 'controllo controllo--spento', readonly: true, 'aria-disabled': 'true', name: 'messaggio',
      onClick: apri, onKeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); apri(); } },
      'aria-label': 'Scrivi un messaggio (disponibile nella versione completa)', placeholder: 'Scrivi un messaggio',
    }),
    h('button', {
      type: 'button', class: 'btn btn-primario sola-lettura', 'aria-disabled': 'true',
      title: 'Disponibile nella versione completa',
      onClick: (e) => { e.stopPropagation(); e.preventDefault(); apri(); },
    }, icona('paper-plane-tilt'), h('span', {}, 'Invia'), h('i', { class: 'ph ph-lock-simple lucchetto', 'aria-hidden': 'true' })));

  return h('div', { class: 'pagina-chat' },
    h('p', { class: 'indietro' }, h('a', { class: 'link-testo', href: `#/eventi/${encodeURIComponent(evento.id)}` },
      icona('arrow-left'), ' Torna all’evento')),
    intestazione({ titolo: 'Chat dell’evento', sottotitolo: evento.titolo }),
    card(null, elenco, barra));
}
