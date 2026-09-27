import { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarRange, ExternalLink, LayoutDashboard, LogOut, Menu as MenuIcon, Table2, UtensilsCrossed, X } from 'lucide-react';
import { logoutAdmin, useIsAdmin } from '@/store/session';
import { Logo } from '@/components/Brand';
import { Toasts } from '@/components/toast';
import { DemoHelper } from '@/components/DemoHelper';
import { StorageNotice } from '@/components/StorageNotice';
import { MotionAttr } from '@/components/Layouts';
import { cx } from '@/lib/cx';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/reservas', label: 'Reservas', icon: CalendarRange },
  { to: '/admin/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/admin/mesas', label: 'Mesas', icon: Table2 },
];

export default function AdminLayout() {
  const isAdmin = useIsAdmin();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: loc.pathname + loc.search }} />;
  const logout = () => {
    logoutAdmin();
    nav('/admin/login');
  };
  return (
    <div className="admin">
      <a href="#admin-main" className="skip-link">
        Saltar al contenido principal
      </a>
      <MotionAttr />
      <StorageNotice />
      <aside className={cx('aside on-dark', open && 'is-open')}>
        <div className="aside__top">
          <Logo to="/admin" className="logo--inv" label="Panel de Mesa, ir al dashboard" />
          <span className="pill pill--demo">Demo</span>
          <button className="icon-btn aside__close" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X aria-hidden />
          </button>
        </div>
        <nav aria-label="Admin">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={({ isActive }) => cx('aside__link', isActive && 'is-active')} onClick={() => setOpen(false)}>
                  <n.icon aria-hidden /> {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="aside__bottom">
          <NavLink to="/" className="aside__link">
            <ExternalLink aria-hidden /> Ver sitio
          </NavLink>
          <button className="aside__link" onClick={logout}>
            <LogOut aria-hidden /> Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="admin__body">
        <header className="admin__bar">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open}>
            <MenuIcon aria-hidden />
          </button>
          <Logo to="/admin" label="Panel de Mesa" />
          <span className="pill pill--demo">Demo</span>
        </header>
        <main id="admin-main" className="admin__main">
          <Outlet />
        </main>
      </div>
      <nav className="admin__tabs" aria-label="Admin móvil">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('admin__tab', isActive && 'is-active')}>
            <n.icon aria-hidden />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <DemoHelper placement="admin" />
      <Toasts />
    </div>
  );
}
