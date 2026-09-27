// Operaciones admin con latencia simulada, avisos y detección de cambios (E-29).
import { getState, mutate } from '@/store/db';
import { cancelReservation, completeReservation, confirmReservation, blockTable, unblockTable } from '@/store/actions';
import type { BlockType, Reservation, TableId } from '@/domain/types';
import { toast } from '@/components/toast';
import { simulateLatency } from '@/lib/motion';

export async function runReservationAction(r: Reservation, action: 'confirm' | 'cancel' | 'complete'): Promise<boolean> {
  await simulateLatency(250, 500);
  const latest = getState().reservations.find((x) => x.id === r.id);
  if (!latest || latest.updatedAt !== r.updatedAt) {
    toast('Esta reserva cambió mientras la veías. Actualizamos los datos; revisa antes de continuar.', { kind: 'info' });
    return false;
  }
  const now = new Date();
  const res = mutate((s) => (action === 'confirm' ? confirmReservation(s, r.id, now) : action === 'cancel' ? cancelReservation(s, r.id, 'Admin', now) : completeReservation(s, r.id, now)));
  if (!res.ok) {
    toast('La acción ya no es válida para esta reserva.', { kind: 'info' });
    return false;
  }
  toast(action === 'confirm' ? 'Reserva confirmada.' : action === 'cancel' ? 'Reserva cancelada.' : 'Reserva marcada como completada.');
  return true;
}

export function doBlock(id: TableId, type: BlockType, note: string) {
  mutate((s) => ({ state: blockTable(s, id, type, note, new Date()), result: null }));
  toast(`Mesa ${id.slice(1)} bloqueada.`);
}

export function doUnblock(id: TableId) {
  mutate((s) => ({ state: unblockTable(s, id), result: null }));
  toast(`Mesa ${id.slice(1)} desbloqueada.`);
}
