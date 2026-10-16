import type { Tree } from '@/lib/types/tree';
import { TreeCard } from './TreeCard';

interface TreeGridProps {
  trees: Tree[];
  onDelete: (id: string) => void;
  onVisualize: (id: string) => void;
  onViewStructure: (id: string) => void;
  isDeleting: boolean;
  canWrite: boolean;
}

export function TreeGrid({ trees, onDelete, onVisualize, onViewStructure, isDeleting, canWrite }: TreeGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-5">
      {trees.map((tree) => (
        <TreeCard
          key={tree.id}
          tree={tree}
          onDelete={onDelete}
          onVisualize={onVisualize}
          onViewStructure={onViewStructure}
          isDeleting={isDeleting}
          canWrite={canWrite}
        />
      ))}
    </div>
  );
}
