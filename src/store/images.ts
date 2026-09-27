// Imágenes de platillos: biblioteca inicial (archivos estáticos) + subidas (IndexedDB). BR-050, BR-051.
import { useEffect, useState } from 'react';

const DB_NAME = 'mesa-imagenes';
const STORE = 'images';
const urlCache = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no-idb'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putImage(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('abort'));
  });
  urlCache.set(id, URL.createObjectURL(blob));
}

async function getBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function clearImages(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* sin IndexedDB */
  }
  urlCache.clear();
}

export function libraryUrl(slug: string): string {
  return `${import.meta.env.BASE_URL}images/dishes/${slug}.webp`;
}

export function syncImageUrl(imageId: string): string | null {
  if (!imageId) return null;
  if (imageId.startsWith('lib:')) return libraryUrl(imageId.slice(4));
  return urlCache.get(imageId) ?? null;
}

/** Devuelve la URL de la imagen (sincrónica para la biblioteca, asíncrona para las subidas). */
export function useImageUrl(imageId: string): { url: string | null; loading: boolean } {
  const [url, setUrl] = useState<string | null>(() => syncImageUrl(imageId));
  const [loading, setLoading] = useState(() => !!imageId && !syncImageUrl(imageId));
  useEffect(() => {
    const direct = syncImageUrl(imageId);
    if (direct || !imageId) {
      setUrl(direct);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    getBlob(imageId).then((b) => {
      if (!alive) return;
      if (b) {
        const u = URL.createObjectURL(b);
        urlCache.set(imageId, u);
        setUrl(u);
      } else setUrl(null);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [imageId]);
  return { url, loading };
}

/** Redimensiona a ≤ 1600 px (lado mayor) y devuelve WebP/JPEG. */
export async function processUpload(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (blob) return blob;
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', 0.86));
}
