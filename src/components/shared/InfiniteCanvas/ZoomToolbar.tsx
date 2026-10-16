import { memo, useCallback } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const zoomSelector = (state: { transform: [number, number, number] }) => state.transform[2];

function ZoomToolbarComponent() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore(zoomSelector);
  const zoomPercentage = Math.round(zoom * 100);

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleResetZoom = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  return (
    <div
      className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-xl border px-2 py-1.5 shadow-[var(--shadow-pop)]"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        pointerEvents: 'auto',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-muted"
        onClick={handleZoomOut}
        title="Zoom out"
      >
        <Minus className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
      </Button>

      <div
        className="px-2 min-w-[50px] text-center font-mono text-sm"
        style={{ color: 'var(--color-foreground)' }}
      >
        {zoomPercentage}%
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-muted"
        onClick={handleZoomIn}
        title="Zoom in"
      >
        <Plus className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
      </Button>

      <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-muted"
        onClick={handleResetZoom}
        title="Fit to screen"
      >
        <RotateCcw className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
      </Button>
    </div>
  );
}

export const ZoomToolbar = memo(ZoomToolbarComponent);
