// Stato di pagina che vive nei moduli (filtri, ricerche, giorno scelto): «Ricomincia» lo azzera.
const azzeratori = [];

/** Le pagine registrano qui una funzione che riporta il loro stato di modulo ai valori iniziali. */
export function registraReset(fn) {
  azzeratori.push(fn);
}

export function azzeraPagine() {
  for (const fn of azzeratori) fn();
}
