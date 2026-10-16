import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cancelSlotRequest } from '@/lib/db/client-operations';

interface CancelSlotRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId: string;
  slotsCount: number;
}

export function CancelSlotRequestDialog({
  isOpen,
  onClose,
  onSuccess,
  requestId,
  slotsCount,
}: CancelSlotRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    const result = await cancelSlotRequest(requestId);
    setLoading(false);

    if (result.ok) {
      onSuccess();
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel Slot Request</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to cancel your pending slot request for {slotsCount} slots?
        </p>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            Go Back
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive"
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
