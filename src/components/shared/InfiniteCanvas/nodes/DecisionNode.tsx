import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { DecisionNodeData } from '../types';

interface DecisionNodeProps {
  data: DecisionNodeData;
}

function DecisionNodeComponent({ data }: DecisionNodeProps) {
  return (
    <div className="relative">
      {/* Top handle for parent connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-muted !border-input !w-2 !h-2"
      />

      {/* Node container */}
      <div
        className="rounded-xl border px-4 py-3 min-w-[160px] shadow-[var(--shadow-card)]"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-input)',
        }}
      >
        {/* Feature name */}
        <div
          className="font-mono text-sm font-medium text-center"
          style={{ color: 'var(--color-foreground)' }}
        >
          {data.featureName}
        </div>
      </div>

      {/* Bottom handle for children */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-muted !border-input !w-2 !h-2"
      />
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeComponent);
