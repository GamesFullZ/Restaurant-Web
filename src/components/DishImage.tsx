import { useState } from 'react';
import { useImageUrl } from '@/store/images';
import { cx } from '@/lib/cx';

interface Props {
  imageId: string;
  alt: string;
  name: string;
  className?: string;
  eager?: boolean;
  style?: React.CSSProperties;
  vtName?: string;
}

/** Imagen de platillo con skeleton y placeholder de marca si falla (EC-92). */
export function DishImage({ imageId, alt, name, className, eager, style, vtName }: Props) {
  const { url, loading } = useImageUrl(imageId);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !loading && (!url || failed);
  return (
    <div className={cx('dish-img', className, loaded && 'is-loaded')} style={{ ...style, viewTransitionName: vtName }}>
      {!loaded && !showPlaceholder && <div className="skeleton dish-img__sk" aria-hidden />}
      {showPlaceholder ? (
        <div className="dish-img__ph" role="img" aria-label={alt || name}>
          <svg viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="56" cy="50" r="12" fill="var(--chile)" opacity="0.85" />
          </svg>
          <span className="serif-i">{name}</span>
        </div>
      ) : (
        url && (
          <img
            src={url}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )
      )}
    </div>
  );
}
