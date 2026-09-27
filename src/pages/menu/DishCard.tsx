import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Dish } from '@/domain/types';
import { formatPrice } from '@/domain/validation';
import { DishImage } from '@/components/DishImage';
import { SoldOutBadge, TagBadge } from '@/components/Tags';
import { cx } from '@/lib/cx';

export function DishCard({ dish, index = 0 }: { dish: Dish; index?: number }) {
  const soldOut = dish.availability === 'Agotado temporalmente';
  return (
    <Link to={`/menu/${dish.slug}`} className={cx('dcard', soldOut && 'is-soldout')} viewTransition data-reveal style={{ ['--i' as string]: index % 3 }}>
      <div className="dcard__media">
        <DishImage imageId={dish.imageId} alt={dish.imageAlt} name={dish.name} vtName={`dish-${dish.slug}`} />
        {soldOut && (
          <div className="dcard__flag">
            <SoldOutBadge />
          </div>
        )}
        <span className="dcard__cta" aria-hidden>
          Ver platillo <ArrowUpRight />
        </span>
      </div>
      <div className="dcard__body">
        <h3 className="dcard__name">{dish.name}</h3>
        <span className="dcard__price tnum">{formatPrice(dish.price)}</span>
        <p className="dcard__desc">{dish.description}</p>
        {dish.tags.length > 0 && (
          <div className="dcard__tags">
            {dish.tags.map((t) => (
              <TagBadge key={t} tag={t} plain />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
