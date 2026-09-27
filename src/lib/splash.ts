/**
 * Pantalla de entrada (definida en index.html para pintar antes que el JS).
 * Se retira cuando la primera página está montada y las fuentes cargaron.
 */
const MIN_VISIBLE_MS = 900;
const MAX_VISIBLE_MS = 4000;
/** Momento en que el telón ya descubrió lo suficiente para que arranquen las entradas. */
const REVEAL_AFTER_MS = 320;

let done = false;
let hiding = false;
const listeners: (() => void)[] = [];

function finish() {
  if (done) return;
  done = true;
  listeners.splice(0).forEach((cb) => cb());
}

/** Ejecuta `cb` cuando el telón ya dejó ver la página (inmediato si no hay telón). */
export function onSplashDone(cb: () => void) {
  if (done || !document.getElementById('splash')) cb();
  else listeners.push(cb);
}

export function hideSplash() {
  if (hiding) return;
  const el = document.getElementById('splash');
  if (!el) {
    finish();
    return;
  }
  hiding = true;
  const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1500))])
    .then(() => new Promise((r) => setTimeout(r, wait)))
    .then(() => {
      requestAnimationFrame(() => {
        el.classList.add('is-out');
        setTimeout(finish, REVEAL_AFTER_MS);
        setTimeout(() => el.remove(), 1200);
      });
    });
}

// Red de seguridad: nunca bloquear la página si algo falla al montar.
setTimeout(hideSplash, MAX_VISIBLE_MS);
