// Estado abierto/cerrado (FR-012).
import { SERVICE } from '@/domain/constants';
import { slotToMin } from './dates';

export function openStatus(now: Date): { open: boolean; label: string; detail: string } {
  const day = now.getDay(); // 0 domingo, 1 lunes
  const m = now.getHours() * 60 + now.getMinutes();
  const l1 = slotToMin(SERVICE.Comida.from);
  const l2 = slotToMin(SERVICE.Comida.to);
  const d1 = slotToMin(SERVICE.Cena.from);
  const d2 = slotToMin(SERVICE.Cena.to);
  if (day === 1) return { open: false, label: 'Cerrado ahora', detail: 'Abrimos el martes a las 13:00' };
  if (m >= l1 && m < l2) return { open: true, label: 'Abierto ahora', detail: 'Comida hasta las 17:00' };
  if (m >= d1 && m < d2) return { open: true, label: 'Abierto ahora', detail: 'Cena hasta las 22:30' };
  if (m < l1) return { open: false, label: 'Cerrado ahora', detail: 'Abrimos a las 13:00' };
  if (m >= l2 && m < d1) return { open: false, label: 'Cerrado ahora', detail: 'Abrimos a las 18:00' };
  if (day === 0) return { open: false, label: 'Cerrado ahora', detail: 'Abrimos el martes a las 13:00' };
  return { open: false, label: 'Cerrado ahora', detail: 'Abrimos mañana a las 13:00' };
}
