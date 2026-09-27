// Región viva para lectores de pantalla (docs/14 §6).
let polite: HTMLElement | null = null;
let assertive: HTMLElement | null = null;

function region(kind: 'polite' | 'assertive') {
  const el = document.createElement('div');
  el.className = 'sr-only';
  el.setAttribute('aria-live', kind);
  el.setAttribute('aria-atomic', 'true');
  document.body.appendChild(el);
  return el;
}

export function announce(msg: string, kind: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return;
  if (kind === 'polite') polite ??= region('polite');
  else assertive ??= region('assertive');
  const el = kind === 'polite' ? polite! : assertive!;
  el.textContent = '';
  window.setTimeout(() => (el.textContent = msg), 40);
}
