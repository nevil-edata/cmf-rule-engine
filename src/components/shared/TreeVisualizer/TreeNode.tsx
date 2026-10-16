import type { TreeNode } from '@/lib/types/tree';
import { getLeafColor } from '@/lib/utils/leafColor';
import { isLeafNode } from '@/lib/types/tree';
import {
  parseCondition,
  formatTrueLabel,
  formatFalseLabel,
  type ParsedCondition,
} from './utils';

function getColorForValue(value: number, min: number, max: number): string {
  return getLeafColor(value, min, max);
}

interface TreeNodeProps {
  node: TreeNode;
  isRoot?: boolean;
  minValue: number;
  maxValue: number;
}

function LeafNode({ value, minValue, maxValue }: { value: number; minValue: number; maxValue: number }) {
  const color = getColorForValue(value, minValue, maxValue);
  return (
    <li className="preview-mode leaf">
      <span
        className="report-node-content"
        style={{ backgroundColor: color }}
      >
        {value >= 0 ? '+' : ''}{value.toFixed(3)}
      </span>
    </li>
  );
}

interface DecisionBranchesProps {
  condition: ParsedCondition | null;
  trueBranch: TreeNode;
  falseBranch: TreeNode;
  minValue: number;
  maxValue: number;
}

function DecisionBranches({
  condition,
  trueBranch,
  falseBranch,
  minValue,
  maxValue,
}: DecisionBranchesProps) {
  if (!condition) {
    return (
      <>
        <TreeNodeComponent node={trueBranch} minValue={minValue} maxValue={maxValue} />
        <TreeNodeComponent node={falseBranch} minValue={minValue} maxValue={maxValue} />
      </>
    );
  }

  const trueLabel = formatTrueLabel(condition);
  const falseLabel = formatFalseLabel(condition);

  return (
    <>
      <li className="preview-mode">
        <span className="report-node-content">{trueLabel}</span>
        <ul>
          <TreeNodeComponent node={trueBranch} minValue={minValue} maxValue={maxValue} />
        </ul>
      </li>
      <li className="preview-mode">
        <span className="report-node-content">{falseLabel}</span>
        <ul>
          <TreeNodeComponent node={falseBranch} minValue={minValue} maxValue={maxValue} />
        </ul>
      </li>
    </>
  );
}

export function TreeNodeComponent({ node, isRoot = false, minValue, maxValue }: TreeNodeProps) {
  if (isLeafNode(node)) {
    return <LeafNode value={node.value} minValue={minValue} maxValue={maxValue} />;
  }

  const parsed = parseCondition(node.condition);
  const featureLabel = parsed ? parsed.feature : node.condition;

  const classes = ['preview-mode'];
  if (isRoot) classes.push('root');

  return (
    <li className={classes.join(' ')}>
      <span className="report-node-content">
        {featureLabel}
      </span>
      <ul>
        <DecisionBranches
          condition={parsed}
          trueBranch={node.true_branch}
          falseBranch={node.false_branch}
          minValue={minValue}
          maxValue={maxValue}
        />
      </ul>
    </li>
  );
}
