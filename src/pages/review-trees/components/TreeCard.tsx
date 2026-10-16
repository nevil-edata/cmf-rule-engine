import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Activity, Heart, Calendar, Eye, Network } from 'lucide-react';
import type { Tree, TreeNode } from '@/lib/types/tree';
import { isLeafNode } from '@/lib/types/tree';

interface TreeCardProps {
  tree: Tree;
  onDelete: (id: string) => void;
  onVisualize: (id: string) => void;
  onViewStructure: (id: string) => void;
  isDeleting: boolean;
  canWrite: boolean;
}

export function TreeCard({ tree, onDelete, onVisualize, onViewStructure, isDeleting, canWrite }: TreeCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(tree.id);
    setShowConfirm(false);
  };

  const treeCount = tree.structure.length;
  const totalLeaves = tree.structure.reduce((sum, t) => {
    return sum + countLeaves(t.root);
  }, 0);

  return (
    <Card className="group relative overflow-hidden border border-border bg-card text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-input hover:shadow-[var(--shadow-pop)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy-700 via-brand-blue to-teal-500" />
      <CardHeader className="relative pb-2 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg font-semibold leading-tight text-foreground" title={tree.name}>
              {tree.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Calendar className="h-3 w-3" />
              {new Date(tree.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge
            variant={tree.treeType === 'motor' ? 'default' : 'secondary'}
            className="flex flex-shrink-0 items-center gap-1 font-medium"
          >
            {tree.treeType === 'motor' ? (
              <Activity className="h-3 w-3" />
            ) : (
              <Heart className="h-3 w-3" />
            )}
            {tree.treeType === 'motor' ? 'Motor' : 'Medical'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-muted/50 p-3">
            <p className="eyebrow text-[10px]">
              Trees
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground font-mono">{treeCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-3">
            <p className="eyebrow text-[10px]">
              Leaf Nodes
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground font-mono">{totalLeaves}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative flex gap-2 pt-2">
        {!showConfirm ? (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onVisualize(tree.id)}
              className="flex-1"
            >
              <Eye className="h-3.5 w-3.5 mr-2" />
              Visualize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStructure(tree.id)}
              className="flex-1"
            >
              <Network className="h-3.5 w-3.5 mr-2" />
              <span className="hidden xl:inline">Structure</span>
              <span className="xl:hidden">Struct</span>
            </Button>
            {canWrite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function countLeaves(node: TreeNode): number {
  if (isLeafNode(node)) return 1;
  return countLeaves(node.true_branch) + countLeaves(node.false_branch);
}
