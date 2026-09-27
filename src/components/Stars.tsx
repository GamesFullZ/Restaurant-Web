import { Star } from 'lucide-react';

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} width={size} height={size} aria-hidden className={i <= value ? 'on' : 'off'} />
      ))}
    </span>
  );
}
