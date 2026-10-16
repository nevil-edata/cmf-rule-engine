import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EmptyState as BrandEmptyState } from '@/components/brand/EmptyState';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <BrandEmptyState
      illustration="combination"
      eyebrow="Rules"
      title="No datasets found"
      description="You need to upload datasets before creating rules. Datasets provide the structure for rule definitions."
      action={<Button onClick={() => navigate('/datasets')}>Go to Datasets</Button>}
    />
  );
}
