import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { RESTAURANT } from '@/domain/constants';
import { setPrefs, usePrefs } from '@/store/session';
import { SimPill } from './Tags';
import { toast } from './toast';

export function Footer() {
  const prefs = usePrefs();
  return (
    <footer className="site-footer on-dark">
      <div className="greca" aria-hidden />
      <div className="container">
        <div className="site-footer__word display" aria-hidden>
          Mesa
        </div>
        <p className="site-footer__slogan serif-i">{RESTAURANT.slogan}</p>
        <div className="site-footer__cols">
          <div>
            <h2 className="eyebrow">Visítanos</h2>
            <p>{RESTAURANT.address}</p>
            <p className="muted-inv">{RESTAURANT.reference}</p>
          </div>
          <div>
            <h2 className="eyebrow">Horario</h2>
            <p>Martes a domingo</p>
            <p>Comida 13:00–17:00</p>
            <p>Cena 18:00–22:30</p>
            <p>Lunes cerrado</p>
          </div>
          <div>
            <h2 className="eyebrow">Contacto</h2>
            <p className="tnum">{RESTAURANT.phone}</p>
            <button className="btn btn--ghost btn--sm" onClick={() => toast('Llamada simulada: en un restaurante real se abriría tu marcador.', { kind: 'info' })}>
              <Phone aria-hidden /> Llamar <SimPill />
            </button>
            <p className="muted-inv">{RESTAURANT.social}</p>
          </div>
          <nav aria-label="Pie de página">
            <h2 className="eyebrow">Navegación</h2>
            <ul>
              <li><Link viewTransition to="/">Inicio</Link></li>
              <li><Link viewTransition to="/menu">Menú</Link></li>
              <li><Link viewTransition to="/reservar">Reservar</Link></li>
              <li><Link viewTransition to="/mis-reservas">Mis reservas</Link></li>
              <li><Link viewTransition to="/proyecto">Caso de estudio</Link></li>
            </ul>
          </nav>
        </div>
        <div className="site-footer__bar">
          <label className="switch">
            <input
              type="checkbox"
              role="switch"
              checked={prefs.reduceMotion}
              onChange={(e) => setPrefs({ reduceMotion: e.target.checked })}
            />
            <span className="switch__track" aria-hidden />
            Reducir movimiento
          </label>
          <Link viewTransition to="/admin/login" className="site-footer__admin">
            Acceso administrador (demo)
          </Link>
          <p className="site-footer__note">Proyecto de portafolio · Restaurante ficticio. Las reservas se guardan solo en este navegador.</p>
        </div>
      </div>
    </footer>
  );
}
