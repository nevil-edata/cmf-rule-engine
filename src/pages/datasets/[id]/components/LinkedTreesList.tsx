import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Link2, Activity, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { TreeAssociation } from '@/lib/db/operations';
import { LinkTreeDialog } from '@/pages/datasets/components/LinkTreeDialog';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { useAuth } from '@/lib/auth/context';

interface LinkedTreesListProps {
  associations: TreeAssociation[];
  loading: boolean;
  datasetId: number;
  datasetName: string;
  onLinkSuccess: () => void;
  canWrite?: boolean;
}

export default function LinkedTreesList({
  associations,
  loading,
  datasetId,
  datasetName,
  onLinkSuccess,
  canWrite = true,
}: LinkedTreesListProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const handleCreateTree = () => {
    navigate('/generate-tree', {
      state: {
        fromDataset: {
          id: datasetId,
          name: datasetName,
        }
      }
    });
  };

  const handleLinkSuccess = () => {
    setShowLinkDialog(false);
    onLinkSuccess();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Linked Decision Trees <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span></CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              A note of which trees you use with this dataset. You do not need it to score: pick the tree on the Score Claims page.
            </p>
          </div>
          {canWrite && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowLinkDialog(true)}>
                <Link2 className="mr-2 h-4 w-4" />
                Link Existing
              </Button>
              {isAdmin && (
                <Button size="sm" onClick={handleCreateTree}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : associations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No trees linked yet. Ready to use this dataset?
            </p>
            <div className="flex justify-center gap-2">
              <Link to="/table-visualizer">
                <Button>Score this dataset</Button>
              </Link>
              {isAdmin && (
                <Button variant="outline" onClick={handleCreateTree}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create a Tree
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {associations.map(assoc => (
              <div key={assoc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  {assoc.treeType === 'motor' ? (
                    <Activity className="h-5 w-5 text-primary" />
                  ) : (
                    <Heart className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">{assoc.treeName}</p>
                    <p className="text-xs text-muted-foreground">
                      Evaluated {formatRelativeTime(assoc.evaluatedAt)}
                    </p>
                  </div>
                </div>
                <Link to={`/tree-visualizer/${assoc.treeId}`}>
                  <Button size="sm" variant="ghost">View</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {showLinkDialog && (
        <LinkTreeDialog
          datasetId={datasetId}
          datasetName={datasetName}
          existingTreeIds={associations.map(a => a.treeId)}
          onSuccess={handleLinkSuccess}
          onCancel={() => setShowLinkDialog(false)}
        />
      )}
    </Card>
  );
}
