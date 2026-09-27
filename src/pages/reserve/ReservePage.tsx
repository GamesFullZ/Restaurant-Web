import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wizard, type SubmitError } from './Wizard';
import { emptyDraft, type Draft } from './draft';
import { getState, mutate, StorageQuotaError, useDB } from '@/store/db';
import { createReservation, simulateConcurrentBooking, type ReservationInput } from '@/store/actions';
import { clearDraft, markVerified, readDraft, setLastConfirmation, writeDraft } from '@/store/session';
import { SLOT_VALUES } from '@/domain/constants';
import { simulateLatency } from '@/lib/motion';

export function toInput(d: Draft): ReservationInput {
  return {
    date: d.date!,
    slot: d.slot!,
    party: d.party!,
    tableId: d.tableId!,
    occasion: d.occasion,
    occasionOther: d.occasionOther,
    occasionNotes: d.occasionNotes,
    name: d.name,
    phone: d.phone,
    comment: d.comment,
  };
}

export default function ReservePage() {
  const [q] = useSearchParams();
  const nav = useNavigate();
  const db = useDB();

  const initial = useMemo<Draft>(() => {
    const party = Number(q.get('personas'));
    const slot = q.get('horario');
    const date = q.get('fecha');
    if (party >= 1 && party <= 6) {
      const d = emptyDraft();
      d.party = party;
      d.step = 2;
      d.maxStep = 2;
      if (slot && SLOT_VALUES.includes(slot)) {
        d.slot = slot;
        d.step = 3;
        d.maxStep = 3;
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) d.date = date;
      }
      if (!slot) {
        d.step = 1;
      }
      return d;
    }
    return readDraft<Draft>(emptyDraft());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hint = q.get('pista') === 'lunes' ? 'Prueba: elige cualquier lunes del calendario para ver el aviso de día cerrado y sus alternativas.' : null;

  const onChange = useCallback((d: Draft) => writeDraft(d), []);

  const onSubmit = async (d: Draft): Promise<SubmitError | null> => {
    await simulateLatency(500, 900);
    const now = new Date();
    const input = toInput(d);
    try {
      if (getState().meta.simulateConflict) mutate((s) => ({ state: simulateConcurrentBooking(s, input, now), result: null }));
      const res = mutate((s) => createReservation(s, input, now));
      if (res.ok) {
        markVerified(res.value.id);
        setLastConfirmation(res.value.id);
        clearDraft();
        nav('/reservar/confirmacion');
        return null;
      }
      return { error: res.error, duplicateCode: res.duplicateCode, validity: res.validity };
    } catch (e) {
      if (e instanceof StorageQuotaError) return { error: 'quota' };
      return { error: 'unknown' };
    }
  };

  return (
    <Wizard
      mode="new"
      initial={initial}
      onChange={onChange}
      onSubmit={onSubmit}
      onExit={() => {
        clearDraft();
        nav('/');
      }}
      hint={hint}
      simulate={db.meta.simulateConflict}
    />
  );
}
