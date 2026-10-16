import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { FinancialMetrics } from '@/lib/types/trace';

interface PriceDistributionHistogramProps {
  priceDistribution: FinancialMetrics['priceDistribution'];
}

export function PriceDistributionHistogram({ priceDistribution }: PriceDistributionHistogramProps) {
  // Merge high and low bins into single dataset for overlaid area charts

  const data = priceDistribution.high.map((highBin, idx) => ({
    binLabel: highBin.binLabel,
    highRiskCount: highBin.count,
    lowRiskCount: priceDistribution.low[idx]?.count || 0,
  }));

  // If no data, show empty state
  if (data.length === 0 || data.every(d => d.highRiskCount === 0 && d.lowRiskCount === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No price data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ left: 10, right: 20, top: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="binLabel"
          tickLine={false}
          axisLine={false}
          stroke="var(--color-muted-foreground)"
          fontSize={10}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          label={{
            value: 'Count of Claims',
            angle: -90,
            position: 'insideLeft',
            style: { fill: 'var(--color-muted-foreground)', fontSize: 11 },
          }}
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
        />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: 'var(--color-muted-foreground)',
          }}
        />
        {/* Overlaid continuous histograms with transparency */}
        <Area
          type="monotone"
          dataKey="lowRiskCount"
          stroke="var(--color-success)"
          fill="var(--color-success)"
          fillOpacity={0.4}
          strokeWidth={2}
          name="Low Risk (STP)"
        />
        <Area
          type="monotone"
          dataKey="highRiskCount"
          stroke="var(--color-destructive)"
          fill="var(--color-destructive)"
          fillOpacity={0.4}
          strokeWidth={2}
          name="High Risk"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
