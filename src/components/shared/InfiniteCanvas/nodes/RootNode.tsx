import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { RootNodeData } from '../types';

interface RootNodeProps {
  data: RootNodeData;
}

function RootNodeComponent({ data }: RootNodeProps) {
  return (
    <div className="relative">
      {/* Node container */}
      <div
        className="rounded-xl border-2 px-4 py-3 min-w-[180px] shadow-[var(--shadow-card)]"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-primary)',
        }}
      >
        {/* Root Split label */}
        <div
          className="text-[10px] font-medium uppercase tracking-wider mb-1"
          style={{ color: 'var(--color-ring)' }}
        >
          Root Split
        </div>
        {/* Condition/Feature name */}
        <div
          className="font-mono text-sm font-medium"
          style={{ color: 'var(--color-foreground)' }}
        >
          {data.condition}
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

export const RootNode = memo(RootNodeComponent);
