import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Search } from 'lucide-react';
import { getState } from '@/store/db';
import { markVerified } from '@/store/session';
import { isValidCode, normalizeCode, normalizePhone, validatePhone } from '@/domain/validation';
import { SimPill } from '@/components/Tags';
import { useTitle } from '@/lib/useTitle';
import { simulateLatency } from '@/lib/motion';
import { cx } from '@/lib/cx';
import './my.css';

export default function MyAccess() {
  useTitle('Mis reservas');
  const [q] = useSearchParams();
  const nav = useNavigate();
  const [code, setCode] = useState(q.get('codigo') ?? '');
  const [phone, setPhone] = useState(q.get('tel') ?? '');
  const [errors, setErrors] = useState<{ code?: string; phone?: string }>({});
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = normalizeCode(code);
    const errs: typeof errors = {};
    if (!isValidCode(c)) errs.code = 'Escribe un código como MESA-4F7K.';
    const pe = validatePhone(phone);
    if (pe) errs.phone = pe;
    setErrors(errs);
    setNotFound(false);
    if (Object.keys(errs).length) {
      window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 20);
      return;
    }
    setBusy(true);
    await simulateLatency(300, 600);
    setBusy(false);
    const r = getState().reservations.find((x) => x.code === c && x.phone === normalizePhone(phone) && x.origin !== 'Demo');
    if (!r) {
      setNotFound(true);
      return;
    }
    markVerified(r.id);
    nav(`/mis-reservas/${r.code}`);
  };

  return (
    <section className="my-page my-access">
      <div className="container my-access__grid">
        <div className="my-access__intro">
          <p className="eyebrow accent">Sin cuenta, sin correo</p>
          <h1 className="my-title display">
            Mis <span className="serif-i">reservas</span>
          </h1>
          <p className="lead">Consulta, cambia o cancela tu reserva con tu código y tu teléfono.</p>
          <div className="ticket-art" aria-hidden>
            <span className="mono">MESA-····</span>
            <svg viewBox="0 0 100 100">
              <path d="M0 0 H50 A50 50 0 0 1 0 50 Z" fill="var(--chile)" />
              <path d="M100 100 H50 A50 50 0 0 1 100 50 Z" fill="var(--maiz)" />
            </svg>
          </div>
        </div>
        <form className="my-form card" onSubmit={submit} noValidate>
          {notFound && (
            <div className="alert alert--error" role="alert">
              <AlertTriangle aria-hidden />
              <p className="alert__title">No encontramos una reserva con esos datos.</p>
              <p className="alert__text">Revisa que el código y el teléfono sean los que usaste al reservar.</p>
              <div className="alert__actions">
                <Link viewTransition to="/reservar" className="btn btn--sm btn--ghost">
                  Reservar mesa
                </Link>
              </div>
            </div>
          )}
          <div className={cx('field', errors.code && 'field--error')}>
            <label className="field__label" htmlFor="m-code">
              Código de reserva
            </label>
            <input id="m-code" className="input mono" placeholder="MESA-4F7K" autoCapitalize="characters" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!errors.code} aria-describedby="m-code-e" />
            {errors.code && (
              <p id="m-code-e" className="field__error">
                <AlertTriangle aria-hidden />
                {errors.code}
              </p>
            )}
          </div>
          <div className={cx('field', errors.phone && 'field--error')}>
            <label className="field__label" htmlFor="m-phone">
              Teléfono
            </label>
            <input id="m-phone" className="input tnum" type="tel" inputMode="tel" autoComplete="tel" placeholder="81 1234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby="m-phone-e" />
            {errors.phone && (
              <p id="m-phone-e" className="field__error">
                <AlertTriangle aria-hidden />
                {errors.phone}
              </p>
            )}
          </div>
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy ? <span className="spinner" aria-hidden /> : <Search aria-hidden />} {busy ? 'Buscando…' : 'Buscar mi reserva'}
          </button>
          <p className="my-form__help">
            ¿Perdiste tu código? En un restaurante real te lo reenviaríamos por SMS. <SimPill />
          </p>
          <Link viewTransition to="/reservar" className="link my-form__alt">
            ¿Aún no reservas? Reservar mesa <ArrowUpRight aria-hidden width={16} />
          </Link>
        </form>
      </div>
    </section>
  );
}
