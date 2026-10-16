import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import { RuleExecutor } from './RuleExecutor';
import { evaluateClaim } from './engine';
import type { RuleItem } from '../types/ruleBuilder';
import type { ClaimData } from '../types/claim';
import type { TreeNode } from '../types/tree';

const rule = (operator: '=' | '!=', value: boolean): RuleItem => ({
  id: 'r1',
  field: 'TotalLoss',
  operator,
  value,
  effect: 'moderate',
});

const matches = (rules: RuleItem[], claim: ClaimData) =>
  new RuleExecutor(rules).evaluate(claim).totalMatches;

describe('RuleExecutor boolean rules', () => {
  it('matches real booleans', () => {
    expect(matches([rule('=', true)], { TotalLoss: true })).toBe(1);
    expect(matches([rule('=', true)], { TotalLoss: false })).toBe(0);
  });

  it('matches the text True / False that Python and Excel exports use', () => {
    expect(matches([rule('=', true)], { TotalLoss: 'True' })).toBe(1);
    expect(matches([rule('=', true)], { TotalLoss: 'False' })).toBe(0);
    expect(matches([rule('=', false)], { TotalLoss: 'False' })).toBe(1);
    expect(matches([rule('=', false)], { TotalLoss: 'True' })).toBe(0);
    expect(matches([rule('=', true)], { TotalLoss: ' TRUE ' })).toBe(1);
  });

  it('handles not-equals the same way', () => {
    expect(matches([rule('!=', true)], { TotalLoss: 'False' })).toBe(1);
    expect(matches([rule('!=', true)], { TotalLoss: 'True' })).toBe(0);
  });

  it('works on values read from a CSV file by the parser the app uses', () => {
    const csv = 'Claim number,TotalLoss\nA1,True\nA2,False\nA3,True\n';
    const { data } = Papa.parse<ClaimData>(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });
    const total = data.filter((claim) => matches([rule('=', true)], claim) > 0).length;
    expect(total).toBe(2);
  });

  it('still compares numbers and text as before', () => {
    const numeric: RuleItem = { id: 'n', field: 'Age', operator: '=', value: 5, effect: 'high' };
    expect(matches([numeric], { Age: 5 })).toBe(1);
    expect(matches([numeric], { Age: '5' })).toBe(1);
    expect(matches([numeric], { Age: 6 })).toBe(0);
  });
});

describe('tree scoring with True / False text', () => {
  const tree: { title: string; root: TreeNode }[] = [
    {
      title: 'Tree #1',
      root: { condition: 'TotalLoss > 0', true_branch: { value: 5 }, false_branch: { value: -1 } },
    },
  ];

  it('reads the text True as 1 and False as 0', () => {
    expect(evaluateClaim({ TotalLoss: 'True' }, tree).totalScore).toBe(5);
    expect(evaluateClaim({ TotalLoss: 'False' }, tree).totalScore).toBe(-1);
  });
});
