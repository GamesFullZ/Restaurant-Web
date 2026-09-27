import { useRef, useState } from 'react';
import { Copy, Map, Navigation } from 'lucide-react';
import { RESTAURANT } from '@/domain/constants';
import { IllustratedMap } from '@/components/IllustratedMap';
import { Dialog } from '@/components/Dialog';
import { SimPill } from '@/components/Tags';
import { toast } from '@/components/toast';
import { openStatus } from '@/lib/hours';
import { useNow } from '@/lib/useNow';
import { useReveal } from '@/lib/reveal';

export function Location() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const now = useNow();
  const st = openStatus(now);
  const [mapsOpen, setMapsOpen] = useState(false);
  const [manual, setManual] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(RESTAURANT.address);
      toast('Dirección copiada.');
    } catch {
      setManual(true);
    }
  };

  return (
    <section ref={ref} id="ubicacion" className="location" aria-labelledby="loc-title">
      <div className="container location__grid">
        <div className="location__info">
          <p className="eyebrow accent" data-reveal>
            Restaurante y ubicación
          </p>
          <h2 id="loc-title" className="h2 reveal-group">
            <span className="split-line">
              <span>En el Barrio</span>
            </span>
            <span className="split-line" style={{ ['--i' as string]: 1 }}>
              <span className="serif-i">Antiguo.</span>
            </span>
          </h2>
          <p className="lead" data-reveal>
            Una casona de cantera con interiores contemporáneos, a pasos de la Macroplaza.
          </p>
          <div className="location__status" data-reveal>
            <span className={`dot ${st.open ? 'dot--on' : ''}`} aria-hidden />
            <strong>{st.label}</strong>
            <span>· {st.detail}</span>
          </div>
          <dl className="hours" data-reveal>
            <div>
              <dt>Martes a domingo</dt>
              <dd />
            </div>
            <div>
              <dt>Comida</dt>
              <dd className="tnum">13:00–17:00</dd>
            </div>
            <div>
              <dt>Cena</dt>
              <dd className="tnum">18:00–22:30</dd>
            </div>
            <div>
              <dt>Lunes</dt>
              <dd>Cerrado</dd>
            </div>
          </dl>
        </div>
        <div className="location__map" data-reveal="scale">
          <IllustratedMap />
          <div className="howto">
            <h3 className="howto__title">
              <Navigation aria-hidden /> Cómo llegar
            </h3>
            <p className="howto__addr">{RESTAURANT.address}</p>
            <p className="muted howto__ref">{RESTAURANT.reference}</p>
            {manual && (
              <p className="howto__manual" role="status">
                Selecciona y copia: <span className="user-select-all">{RESTAURANT.address}</span>
              </p>
            )}
            <div className="howto__actions">
              <button className="btn btn--primary btn--sm" onClick={() => setMapsOpen(true)}>
                <Map aria-hidden /> Abrir en Google Maps <SimPill />
              </button>
              <button className="btn btn--ghost btn--sm" onClick={copy}>
                <Copy aria-hidden /> Copiar dirección
              </button>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={mapsOpen}
        onClose={() => setMapsOpen(false)}
        title="Acción simulada"
        initialFocus="[data-safe]"
        actions={
          <button className="btn" data-safe onClick={() => setMapsOpen(false)}>
            Entendido
          </button>
        }
      >
        <p>En un restaurante real, este botón abriría Google Maps con la ruta a Mesa. En esta demo la acción está simulada.</p>
      </Dialog>
    </section>
  );
}
