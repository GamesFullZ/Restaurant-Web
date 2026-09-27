import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  /** Selector del elemento que recibe el foco inicial (opción segura). */
  initialFocus?: string;
  labelledBy?: string;
}

/** Diálogo nativo: foco atrapado, Escape cierra y el foco vuelve al disparador (docs/14 §2). */
export function Dialog({ open, onClose, title, children, actions, initialFocus }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
      const target = initialFocus ? d.querySelector<HTMLElement>(initialFocus) : null;
      window.setTimeout(() => target?.focus(), 30);
    } else if (!open && d.open) {
      d.close();
      (opener.current as HTMLElement | null)?.focus?.();
    }
  }, [open, initialFocus]);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="dialog__body">
          <h2 id="dialog-title" className="dialog__title">
            {title}
          </h2>
          {children}
          {actions && <div className="dialog__actions">{actions}</div>}
        </div>
      )}
    </dialog>
  );
}
