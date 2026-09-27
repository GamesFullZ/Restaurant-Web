import { Flame, Heart, Leaf, Sparkles, Sprout, Star, WheatOff, Clock3 } from 'lucide-react';
import type { ReservationStatus, Tag } from '@/domain/types';
import { CheckCircle2, CircleDot, PencilLine, XCircle, Award } from 'lucide-react';

const TAG_ICON: Record<Tag, typeof Leaf> = {
  Vegetariano: Leaf,
  Picante: Flame,
  Vegano: Sprout,
  'Sin gluten': WheatOff,
  Recomendado: Star,
  Nuevo: Sparkles,
  'Favorito de la casa': Heart,
};

const TAG_CLASS: Partial<Record<Tag, string>> = {
  Nuevo: 'tag--nuevo',
  'Favorito de la casa': 'tag--favorito',
  Recomendado: 'tag--recomendado',
};

export function TagBadge({ tag, plain }: { tag: Tag; plain?: boolean }) {
  const Icon = TAG_ICON[tag];
  return (
    <span className={`tag ${plain ? '' : TAG_CLASS[tag] ?? ''}`}>
      <Icon aria-hidden />
      {tag}
    </span>
  );
}

export function SoldOutBadge() {
  return (
    <span className="tag tag--agotado">
      <Clock3 aria-hidden />
      Agotado temporalmente
    </span>
  );
}

const STATUS: Record<ReservationStatus, { cls: string; Icon: typeof Leaf }> = {
  Pendiente: { cls: 'status--pending', Icon: CircleDot },
  Confirmada: { cls: 'status--confirmed', Icon: CheckCircle2 },
  Modificada: { cls: 'status--modified', Icon: PencilLine },
  Cancelada: { cls: 'status--cancelled', Icon: XCircle },
  Completada: { cls: 'status--completed', Icon: Award },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { cls, Icon } = STATUS[status];
  return (
    <span className={`status ${cls}`}>
      <Icon aria-hidden />
      {status}
    </span>
  );
}

export function SimPill({ label = 'Simulado' }: { label?: string }) {
  return <span className="pill pill--sim">{label}</span>;
}
