import { useSyncExternalStore } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { announce } from '@/lib/announce';

interface ToastItem {
  id: number;
  msg: string;
  action?: { label: string; onClick: () => void };
  kind: 'ok' | 'info';
}

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(msg: string, opts: { action?: ToastItem['action']; kind?: ToastItem['kind']; duration?: number } = {}) {
  const id = ++seq;
  items = [...items.slice(-2), { id, msg, action: opts.action, kind: opts.kind ?? 'ok' }];
  emit();
  announce(msg);
  window.setTimeout(() => dismiss(id), opts.duration ?? (opts.action ? 8000 : 5000));
}

export function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function Toasts() {
  const list = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => items,
    () => items,
  );
  return (
    <div className="toasts">
      {list.map((t) => (
        <div key={t.id} className="toast on-dark" role="status">
          {t.kind === 'ok' ? <CheckCircle2 aria-hidden /> : <Info aria-hidden />}
          <span className="toast__msg">{t.msg}</span>
          {t.action && (
            <button
              className="btn btn--sm"
              onClick={() => {
                t.action!.onClick();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
