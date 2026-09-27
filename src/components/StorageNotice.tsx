import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { resetDemo, useStorageStatus } from '@/store/db';
import { clearImages } from '@/store/images';
import { clearSession } from '@/store/session';

/** G-05 · aviso persistente y E-18 · recuperación de datos dañados. */
export function StorageNotice() {
  const status = useStorageStatus();
  const [min, setMin] = useState(false);
  if (status === 'ok') return null;
  if (status === 'corrupt') {
    return (
      <div className="recovery on-dark" role="alertdialog" aria-labelledby="rec-t">
        <div className="recovery__card">
          <AlertTriangle aria-hidden />
          <h1 id="rec-t" className="dialog__title">No pudimos leer los datos guardados.</h1>
          <p>Restablece la demo para continuar.</p>
          <button
            className="btn btn--primary"
            onClick={async () => {
              await clearImages();
              clearSession();
              resetDemo();
            }}
          >
            Restablecer demo
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`storage-banner on-dark ${min ? 'is-min' : ''}`} role="status">
      <AlertTriangle aria-hidden />
      <p>
        <strong>Tus cambios no se guardarán al cerrar esta pestaña.</strong>{' '}
        {!min && 'Tu navegador no permite guardar datos locales (¿modo privado?).'}
      </p>
      <button className="icon-btn" onClick={() => setMin((m) => !m)} aria-label={min ? 'Expandir aviso' : 'Minimizar aviso'}>
        {min ? <ChevronDown aria-hidden /> : <ChevronUp aria-hidden />}
      </button>
    </div>
  );
}
