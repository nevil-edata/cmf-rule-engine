import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmptyState as BrandEmptyState } from '@/components/brand/EmptyState';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  isAdmin?: boolean;
}

export function EmptyState({ isAdmin = false }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <BrandEmptyState
      illustration="car"
      eyebrow="Decision trees"
      title="No trees yet"
      description="Create your first decision tree to explore real-time fraud detection analysis."
      action={
        isAdmin ? (
          <Button onClick={() => navigate('/generate-tree')} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create your first tree
          </Button>
        ) : undefined
      }
    />
  );
}
