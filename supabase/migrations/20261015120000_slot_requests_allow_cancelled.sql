-- Fix: cancel_slot_request() (20260515160000) sets status = 'cancelled', but the original
-- CHECK on slot_requests.status only allowed pending / approved / denied, so every cancel
-- would fail with a constraint violation. Widen the constraint.
-- Finds the CHECK by its definition instead of assuming its name.

DO $$
DECLARE
  v_name TEXT;
BEGIN
  FOR v_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.slot_requests'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.slot_requests DROP CONSTRAINT %I', v_name);
  END LOOP;
END;
$$;

ALTER TABLE public.slot_requests
  ADD CONSTRAINT slot_requests_status_check
  CHECK (status IN ('pending', 'approved', 'denied', 'cancelled'));
