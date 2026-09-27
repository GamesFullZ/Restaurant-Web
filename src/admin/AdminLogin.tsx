import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Info } from 'lucide-react';
import { loginAdmin, useIsAdmin } from '@/store/session';
import { Logo } from '@/components/Brand';
import { useTitle } from '@/lib/useTitle';
import { MotionAttr } from '@/components/Layouts';
import { simulateLatency } from '@/lib/motion';
import './admin.css';

export default function AdminLogin() {
  useTitle('Panel de Mesa');
  const isAdmin = useIsAdmin();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? '/admin';
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  if (isAdmin) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await simulateLatency(300, 500);
    setBusy(false);
    if (loginAdmin(user, pass)) nav(from, { replace: true });
    else {
      setError(true);
      setPass('');
      document.getElementById('a-user')?.focus();
    }
  };

  return (
    <div className="login">
      <MotionAttr />
      <aside className="login__brand on-dark" aria-hidden>
        <Logo className="logo--inv" />
        <span className="pill pill--demo">Demo</span>
        <svg viewBox="0 0 1000 620" className="login__plan">
          {[
            [120, 118, 35],
            [400, 118, 50],
            [872, 118, 35],
            [110, 300, 35],
            [380, 300, 50],
            [872, 305, 50],
            [128, 478, 50],
            [640, 440, 35],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="currentColor" strokeWidth="2" />
          ))}
          <rect x="510" y="240" width="200" height="90" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="772" y="455" width="200" height="90" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="320" y="532" width="360" height="34" rx="6" fill="currentColor" opacity="0.4" />
          <rect x="0" y="0" width="1000" height="620" rx="18" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <p className="login__tag serif-i">El día de un vistazo.</p>
      </aside>
      <main className="login__main">
        <Link to="/" className="back-link">
          <ArrowLeft aria-hidden /> Ver sitio
        </Link>
        <form className="login__form" onSubmit={submit} noValidate>
          <h1 className="login__title display">Panel de Mesa</h1>
          <div className="alert alert--info">
            <Info aria-hidden />
            <p className="alert__text">
              Acceso de demostración: usuario <strong>admin</strong>, contraseña <strong>mesa-demo</strong>. No es un sistema de autenticación real.
            </p>
          </div>
          {error && (
            <div className="alert alert--error" role="alert">
              <AlertTriangle aria-hidden />
              <p className="alert__title">Usuario o contraseña incorrectos. Para la demo usa admin / mesa-demo.</p>
            </div>
          )}
          <div className="field">
            <label className="field__label" htmlFor="a-user">
              Usuario
            </label>
            <input id="a-user" className="input" autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="a-pass">
              Contraseña
            </label>
            <div className="pass">
              <input id="a-pass" className="input" type={show ? 'text' : 'password'} autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
              <button type="button" className="icon-btn pass__btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </button>
            </div>
          </div>
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy && <span className="spinner" aria-hidden />} Entrar
          </button>
        </form>
      </main>
    </div>
  );
}
