import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { FinancialMetrics } from '@/lib/types/trace';
import { formatCurrency } from '../utils/formatCurrency';

interface ValueByRiskChartProps {
  valueByRisk: FinancialMetrics['valueByRisk'];
}

export function ValueByRiskChart({ valueByRisk }: ValueByRiskChartProps) {
  const data = [
    {
      riskLevel: 'Low Risk (STP)',
      totalValue: valueByRisk.low.totalValue,
      avgValue: valueByRisk.low.avgValue,
    },
    {
      riskLevel: 'Moderate',
      totalValue: valueByRisk.moderate.totalValue,
      avgValue: valueByRisk.moderate.avgValue,
    },
    {
      riskLevel: 'High Risk',
      totalValue: valueByRisk.high.totalValue,
      avgValue: valueByRisk.high.avgValue,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <YAxis
          type="category"
          dataKey="riskLevel"
          tickLine={false}
          axisLine={false}
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-foreground)', marginBottom: '4px' }}
          itemStyle={{ color: 'var(--color-muted-foreground)' }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: 'var(--color-muted-foreground)',
          }}
        />
        <Bar
          dataKey="totalValue"
          fill="var(--color-primary)"
          name="Total Value"
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="avgValue"
          fill="var(--color-success)"
          name="Avg Value"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
