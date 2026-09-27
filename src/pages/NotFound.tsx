import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTitle } from '@/lib/useTitle';

export function NotFoundContent({ dish }: { dish?: boolean }) {
  useTitle(dish ? 'Platillo no disponible' : 'Página no encontrada');
  return (
    <section className="nf">
      <div className="container nf__grid">
        <div className="nf__copy">
          <p className="eyebrow accent">{dish ? 'Menú' : 'Error 404'}</p>
          <h1 className="nf__title display">{dish ? <>Este platillo no está <span className="serif-i">disponible</span> en este momento.</> : <>Esta mesa <span className="serif-i">no existe.</span></>}</h1>
          <p className="lead">{dish ? 'Puede que esté oculto temporalmente o que haya cambiado de nombre.' : 'La página que buscas no está aquí.'}</p>
          <div className="nf__actions">
            {dish ? (
              <Link to="/menu" className="btn btn--primary btn--lg">
                Ver menú
              </Link>
            ) : (
              <>
                <Link to="/" className="btn btn--ghost">
                  Inicio
                </Link>
                <Link to="/menu" className="btn btn--ghost">
                  Menú
                </Link>
                <Link to="/reservar" className="btn btn--primary">
                  Reservar mesa <ArrowUpRight className="arrow" aria-hidden />
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="nf__img" aria-hidden>
          <img src={`${import.meta.env.BASE_URL}images/mesa-vacia.webp`} alt="" />
        </div>
      </div>
    </section>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}
