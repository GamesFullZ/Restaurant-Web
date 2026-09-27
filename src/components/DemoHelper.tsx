import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarX2, FlaskConical, KeyRound, LayoutDashboard, RotateCcw, Search, Timer, Users, X } from 'lucide-react';
import { getState, resetDemo, update, useDB } from '@/store/db';
import { clearImages } from '@/store/images';
import { clearSession, markVerified, clearDraft } from '@/store/session';
import { operatingDay } from '@/data/seed';
import { formatLong, toISODate, diffDays } from '@/lib/dates';
import { DEMO } from '@/domain/constants';
import { Dialog } from './Dialog';
import { toast } from './toast';
import { cx } from '@/lib/cx';

/** G-03 · “Prueba estas funciones” (FR-068). */
export function DemoHelper({ placement = 'public' }: { placement?: 'public' | 'admin' }) {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const db = useDB();
  const nav = useNavigate();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const today = toISODate(new Date());
  const noAvailDate = operatingDay(today, 4);
  const stale = diffDays(today, db.meta.seededAt.slice(0, 10)) > 7;

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('button, a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    nav(to);
  };

  const openDemoReservation = () => {
    const r = getState().reservations.find((x) => x.code === DEMO.code);
    if (r) {
      markVerified(r.id);
      go(`/mis-reservas/${r.code}`);
    } else go(`/mis-reservas?codigo=${DEMO.code}`);
  };

  const items = [
    { icon: Timer, title: 'Reserva en 2 minutos', text: 'Elige mesa en el mapa y recibe tu código.', action: 'Empezar', run: () => { clearDraft(); go('/reservar'); } },
    { icon: Search, title: 'Consulta una reserva', text: `Código ${DEMO.code} · Teléfono ${DEMO.phone}`, action: 'Abrir con estos datos', run: openDemoReservation },
    { icon: Users, title: 'Sin disponibilidad', text: `6 personas · 20:00 · ${formatLong(noAvailDate)}`, action: 'Probar', run: () => { clearDraft(); go(`/reservar?personas=6&horario=20:00&fecha=${noAvailDate}`); } },
    { icon: CalendarX2, title: 'Día cerrado', text: 'Elige cualquier lunes en el calendario.', action: 'Probar', run: () => { clearDraft(); go('/reservar?personas=2&horario=20:00&pista=lunes'); } },
  ];

  return (
    <>
      <button
        ref={trigger}
        className={cx('demo-trigger', placement === 'admin' && 'demo-trigger--admin', open && 'is-hidden')}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="demo-panel"
      >
        <FlaskConical aria-hidden />
        <span>Prueba estas funciones</span>
      </button>
      <div className={cx('demo-scrim', open && 'is-open')} onClick={() => setOpen(false)} aria-hidden />
      <aside id="demo-panel" ref={panel} className={cx('demo-panel', open && 'is-open')} aria-label="Prueba estas funciones" hidden={!open}>
        <div className="demo-panel__head">
          <span className="pill pill--demo">Demo</span>
          <button className="icon-btn" aria-label="Cerrar panel" onClick={() => { setOpen(false); trigger.current?.focus(); }}>
            <X aria-hidden />
          </button>
        </div>
        <h2 className="demo-panel__title display">Prueba estas funciones</h2>
        <p className="muted">Esta es una demo funcional: todo se guarda en tu navegador.</p>
        {stale && (
          <p className="alert alert--info demo-panel__stale">Los datos de demo tienen más de 7 días. Te sugerimos restablecerlos.</p>
        )}
        <ol className="demo-list">
          {items.map((it, i) => (
            <li key={it.title}>
              <span className="demo-list__n mono">{i + 1}</span>
              <it.icon aria-hidden className="demo-list__icon" />
              <div>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </div>
              <button className="btn btn--sm btn--ghost" onClick={it.run}>
                {it.action}
              </button>
            </li>
          ))}
          <li>
            <span className="demo-list__n mono">5</span>
            <FlaskConical aria-hidden className="demo-list__icon" />
            <div>
              <h3>Reserva simultánea</h3>
              <p>Al confirmar, alguien más aparta tu mesa (“La disponibilidad acaba de cambiar”).</p>
            </div>
            <label className="switch switch--light">
              <input
                type="checkbox"
                role="switch"
                checked={db.meta.simulateConflict}
                onChange={(e) => {
                  const v = e.target.checked;
                  update((s) => ({ ...s, meta: { ...s.meta, simulateConflict: v } }));
                  toast(v ? 'Simulación activa: la próxima confirmación tendrá un conflicto.' : 'Simulación desactivada.', { kind: 'info' });
                }}
              />
              <span className="switch__track" aria-hidden />
              <span className="sr-only">Simular que alguien reserva tu mesa al confirmar</span>
            </label>
          </li>
          <li>
            <span className="demo-list__n mono">6</span>
            <LayoutDashboard aria-hidden className="demo-list__icon" />
            <div>
              <h3>Panel admin</h3>
              <p>
                Usuario <strong className="mono">{DEMO.adminUser}</strong> · Contraseña <strong className="mono">{DEMO.adminPass}</strong>
              </p>
            </div>
            <button className="btn btn--sm btn--ghost" onClick={() => go('/admin')}>
              <KeyRound aria-hidden /> Ir al panel
            </button>
          </li>
        </ol>
        <button className="btn btn--danger btn--block" onClick={() => setConfirmReset(true)}>
          <RotateCcw aria-hidden /> Restablecer datos de demo
        </button>
      </aside>
      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="¿Restablecer los datos de la demo?"
        initialFocus="[data-safe]"
        actions={
          <>
            <button className="btn btn--ghost" data-safe onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
            <button
              className="btn btn--primary"
              onClick={async () => {
                await clearImages();
                clearSession();
                resetDemo();
                setConfirmReset(false);
                setOpen(false);
                toast('Datos de demo restablecidos.');
                nav('/');
              }}
            >
              Restablecer
            </button>
          </>
        }
      >
        <p>Se borrarán reservas, cambios del menú y bloqueos hechos en este navegador.</p>
      </Dialog>
    </>
  );
}
