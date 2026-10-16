import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { requestCompanySlots } from '@/lib/db/client-operations';

interface RequestSlotsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hasPending: boolean;
}

export function RequestSlotsDialog({ isOpen, onClose, onSuccess, hasPending }: RequestSlotsDialogProps) {
  const [slotsCount, setSlotsCount] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasPending) {
      setError('You already have a pending slot request');
      return;
    }

    const count = parseInt(slotsCount, 10);
    if (isNaN(count) || count < 1 || count > 50) {
      setError('Please request between 1 and 50 slots');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await requestCompanySlots(count);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Additional Slots</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Submit a slot request for admin review.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slots">Slots to Request</Label>
            <Input
              id="slots"
              type="number"
              min="1"
              max="50"
              value={slotsCount}
              onChange={(e) => setSlotsCount(e.target.value)}
              disabled={loading || hasPending}
              required
              className="bg-card border-border text-foreground"
            />
            {hasPending && (
              <p className="text-xs text-destructive">
                Disabled: A pending slot request already exists.
              </p>
            )}
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || hasPending}
              className="bg-muted/50 text-foreground hover:bg-muted"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
