// Reglas de menú. BR-040 – BR-048.
import { CATEGORIES, FEATURED_RULE, FEATURED_SLUGS } from './constants';
import type { CategoryId, Dish } from './types';

export function isPublic(d: Dish): boolean {
  return !d.deletedAt && d.availability !== 'Oculto';
}

export function sortDishes(dishes: Dish[]): Dish[] {
  const order = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));
  return [...dishes].sort((a, b) => order[a.categoryId] - order[b.categoryId] || a.position - b.position);
}

export function publicMenu(dishes: Dish[]): { id: CategoryId; name: string; blurb: string; dishes: Dish[] }[] {
  const pub = sortDishes(dishes.filter(isPublic));
  return CATEGORIES.map((c) => ({ ...c, dishes: pub.filter((d) => d.categoryId === c.id) }));
}

export function nextPosition(dishes: Dish[], categoryId: CategoryId): number {
  const inCat = dishes.filter((d) => d.categoryId === categoryId && !d.deletedAt);
  return inCat.length ? Math.max(...inCat.map((d) => d.position)) + 1 : 1;
}

/** BR-047 · destacados con sustitución */
export function featuredDishes(dishes: Dish[]): Dish[] {
  const pub = sortDishes(dishes.filter(isPublic));
  const used = new Set<string>();
  const out: Dish[] = [];
  for (const slug of FEATURED_SLUGS) {
    const d = pub.find((x) => x.slug === slug && !used.has(x.id));
    if (d) {
      out.push(d);
      used.add(d.id);
      continue;
    }
    const tag = FEATURED_RULE[slug];
    const sub = pub.find((x) => x.tags.includes(tag) && !used.has(x.id) && !FEATURED_SLUGS.includes(x.slug));
    if (sub) {
      out.push(sub);
      used.add(sub.id);
    }
  }
  return out;
}

export function featuredBadge(d: Dish, index: number): string {
  const tag = FEATURED_RULE[FEATURED_SLUGS[index]];
  return d.tags.includes(tag) ? tag : d.tags[0] ?? '';
}

/** Orden global del menú (cruza categorías) — FR-023 */
export function neighbors(dishes: Dish[], id: string): { prev?: Dish; next?: Dish } {
  const list = sortDishes(dishes.filter(isPublic));
  const i = list.findIndex((d) => d.id === id);
  if (i < 0) return {};
  return { prev: list[i - 1], next: list[i + 1] };
}

export function related(dishes: Dish[], d: Dish): Dish[] {
  return sortDishes(dishes.filter((x) => isPublic(x) && x.categoryId === d.categoryId && x.id !== d.id)).slice(0, 3);
}
