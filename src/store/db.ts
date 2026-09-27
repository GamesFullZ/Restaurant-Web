// Store persistente en el navegador (BR-054 – BR-056, FR-046 – FR-048).
import { useSyncExternalStore } from 'react';
import { SCHEMA_VERSION } from '@/domain/constants';
import type { DBState } from '@/domain/types';
import { seedState } from '@/data/seed';

const KEY = 'mesa.v1.db';
export type StorageStatus = 'ok' | 'memory' | 'corrupt';

let state: DBState;
let status: StorageStatus = 'ok';
let externalChangeAt = 0;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    const ls = window.localStorage;
    const probe = '__mesa_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

function isValidState(x: unknown): x is DBState {
  const s = x as DBState;
  return (
    !!s &&
    s.version === SCHEMA_VERSION &&
    Array.isArray(s.reservations) &&
    Array.isArray(s.dishes) &&
    Array.isArray(s.images) &&
    typeof s.blocks === 'object' &&
    !!s.meta
  );
}

function readFromStorage(): { state: DBState; status: StorageStatus } {
  const ls = storage();
  if (!ls) return { state: seedState(new Date()), status: 'memory' };
  const raw = ls.getItem(KEY);
  if (!raw) {
    const fresh = seedState(new Date());
    try {
      ls.setItem(KEY, JSON.stringify(fresh));
      return { state: fresh, status: 'ok' };
    } catch {
      return { state: fresh, status: 'memory' };
    }
  }
  try {
    const parsed = JSON.parse(raw);
    if (!isValidState(parsed)) return { state: seedState(new Date()), status: 'corrupt' };
    return { state: parsed, status: 'ok' };
  } catch {
    return { state: seedState(new Date()), status: 'corrupt' };
  }
}

function emit() {
  for (const l of listeners) l();
}

function init() {
  const r = readFromStorage();
  state = r.state;
  status = r.status;
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== KEY && e.key !== null) return;
      const next = readFromStorage();
      if (next.status === 'ok') {
        state = next.state;
        status = 'ok';
        externalChangeAt = Date.now();
        emit();
      }
    });
  }
}
init();

export class StorageQuotaError extends Error {}

function persist(next: DBState) {
  if (status !== 'ok') return;
  const ls = storage();
  if (!ls) {
    status = 'memory';
    return;
  }
  try {
    ls.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new StorageQuotaError('quota');
  }
}

/** Relee lo último guardado (otra pestaña pudo haber cambiado algo) antes de mutar. */
function refresh() {
  if (status !== 'ok') return;
  const r = readFromStorage();
  if (r.status === 'ok') state = r.state;
}

export function getState(): DBState {
  return state;
}

export function getStatus(): StorageStatus {
  return status;
}

export function getExternalChangeAt(): number {
  return externalChangeAt;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Aplica una mutación sobre el estado más reciente y la persiste. */
export function mutate<R>(fn: (s: DBState) => { state: DBState; result: R }): R {
  refresh();
  const { state: next, result } = fn(state);
  if (next !== state) {
    persist(next);
    state = next;
    emit();
  }
  return result;
}

export function update(fn: (s: DBState) => DBState): void {
  mutate((s) => ({ state: fn(s), result: undefined }));
}

export function resetDemo(now = new Date()): void {
  const fresh = seedState(now);
  const ls = storage();
  status = ls ? 'ok' : 'memory';
  if (ls) {
    try {
      ls.setItem(KEY, JSON.stringify(fresh));
    } catch {
      status = 'memory';
    }
  }
  state = fresh;
  emit();
}

export function useDB(): DBState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useStorageStatus(): StorageStatus {
  return useSyncExternalStore(subscribe, getStatus, getStatus);
}

export function useExternalChangeAt(): number {
  return useSyncExternalStore(subscribe, getExternalChangeAt, getExternalChangeAt);
}
