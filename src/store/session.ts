// Estado por pestaña (sessionStorage) y preferencias (localStorage), con tolerancia a fallos.
import { useSyncExternalStore } from 'react';

function safeGet(store: 'session' | 'local', key: string): string | null {
  try {
    return (store === 'session' ? window.sessionStorage : window.localStorage).getItem(key);
  } catch {
    return memory.get(`${store}:${key}`) ?? null;
  }
}

const memory = new Map<string, string>();

function safeSet(store: 'session' | 'local', key: string, value: string | null) {
  try {
    const s = store === 'session' ? window.sessionStorage : window.localStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    if (value === null) memory.delete(`${store}:${key}`);
    else memory.set(`${store}:${key}`, value);
  }
}

export function readJSON<T>(store: 'session' | 'local', key: string, fallback: T): T {
  const raw = safeGet(store, key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(store: 'session' | 'local', key: string, value: unknown) {
  safeSet(store, key, value === undefined ? null : JSON.stringify(value));
}

const K = {
  admin: 'mesa.v1.admin',
  verified: 'mesa.v1.verified',
  draft: 'mesa.v1.draft',
  lastConfirmation: 'mesa.v1.lastConfirmation',
  prefs: 'mesa.v1.prefs',
};

// ---- Sesión admin (BR-053)
const adminListeners = new Set<() => void>();
export function isAdmin(): boolean {
  return readJSON('session', K.admin, null as null | { user: string }) !== null;
}
export function loginAdmin(user: string, pass: string): boolean {
  if (user.trim().toLowerCase() !== 'admin' || pass !== 'mesa-demo') return false;
  writeJSON('session', K.admin, { user: 'admin', at: new Date().toISOString() });
  adminListeners.forEach((l) => l());
  return true;
}
export function logoutAdmin() {
  writeJSON('session', K.admin, undefined);
  adminListeners.forEach((l) => l());
}
export function useIsAdmin(): boolean {
  return useSyncExternalStore(
    (fn) => {
      adminListeners.add(fn);
      return () => adminListeners.delete(fn);
    },
    isAdmin,
    isAdmin,
  );
}

// ---- Reservas verificadas en Mis reservas (BR-031)
export function verifiedIds(): string[] {
  return readJSON<string[]>('session', K.verified, []);
}
export function markVerified(id: string) {
  const ids = new Set(verifiedIds());
  ids.add(id);
  writeJSON('session', K.verified, [...ids]);
}
export function isVerified(id: string): boolean {
  return verifiedIds().includes(id);
}

// ---- Borrador del flujo de reserva (FR-039)
export function readDraft<T>(fallback: T): T {
  return readJSON('session', K.draft, fallback);
}
export function writeDraft(v: unknown) {
  writeJSON('session', K.draft, v);
}
export function clearDraft() {
  writeJSON('session', K.draft, undefined);
}

// ---- Última confirmación (S-05)
export function setLastConfirmation(id: string | null) {
  writeJSON('session', K.lastConfirmation, id ?? undefined);
}
export function getLastConfirmation(): string | null {
  return readJSON<string | null>('session', K.lastConfirmation, null);
}

// ---- Preferencias (FR-069)
export interface Prefs {
  reduceMotion: boolean;
}
const prefListeners = new Set<() => void>();
let prefsCache: Prefs = readJSON<Prefs>('local', K.prefs, { reduceMotion: false });
export function getPrefs(): Prefs {
  return prefsCache;
}
export function setPrefs(p: Partial<Prefs>) {
  prefsCache = { ...prefsCache, ...p };
  writeJSON('local', K.prefs, prefsCache);
  prefListeners.forEach((l) => l());
}
export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (fn) => {
      prefListeners.add(fn);
      return () => prefListeners.delete(fn);
    },
    getPrefs,
    getPrefs,
  );
}

export function clearSession() {
  writeJSON('session', K.admin, undefined);
  writeJSON('session', K.verified, undefined);
  writeJSON('session', K.draft, undefined);
  writeJSON('session', K.lastConfirmation, undefined);
  adminListeners.forEach((l) => l());
}
