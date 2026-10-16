import type { TraceResult, FinancialMetrics } from '@/lib/types/trace';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';
import { ValueByRiskChart } from './ValueByRiskChart';
import { PriceDistributionHistogram } from './PriceDistributionHistogram';
import { Loader2 } from 'lucide-react';
import { Illustration } from '@/components/brand/Illustration';

interface AnalyticsOverviewProps {
  results: TraceResult[];
  financialMetrics: FinancialMetrics | null;
  isLoadingMetrics?: boolean;
}

const BUCKET_COUNT = 10;

// Pie chart colors
const RISK_COLORS = {
  low: 'var(--color-success)',      // Green
  moderate: 'var(--color-warning)', // Orange
  high: 'var(--color-destructive)',     // Red
};

function buildDistribution(results: TraceResult[]) {
  const buckets = Array.from({ length: BUCKET_COUNT }, (_, index) => {
    const start = index * 10;
    const end = index === BUCKET_COUNT - 1 ? 100 : (index + 1) * 10;
    return {
      bucket: `${start}-${end}%`,
      count: 0,
    };
  });

  results.forEach((result) => {
    const percent = Math.max(0, Math.min(1, result.probability)) * 100;
    const bucketIndex = Math.min(BUCKET_COUNT - 1, Math.floor(percent / 10));
    buckets[bucketIndex].count += 1;
  });

  return buckets;
}

export function AnalyticsOverview({ results, financialMetrics, isLoadingMetrics }: AnalyticsOverviewProps) {
  if (results.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Illustration name="histogram" className="h-16 w-auto max-w-[80%]" />
        <p className="text-sm text-muted-foreground">Process claims to view analytics.</p>
      </div>
    );
  }

  const total = results.length;
  const stpCount = results.filter((r) => r.probability < 0.5).length;
  const moderateCount = results.filter((r) => r.probability >= 0.5 && r.probability < 0.75).length;
  const highRiskCount = total - stpCount - moderateCount;

  const averageScore = results.reduce((sum, r) => sum + r.totalScore, 0) / total;
  const averageProbability = results.reduce((sum, r) => sum + r.probability, 0) / total;

  const distributionData = buildDistribution(results);

  // Pie chart data
  const pieData = [
    { name: 'STP', value: stpCount, color: RISK_COLORS.low },
    { name: 'Moderate', value: moderateCount, color: RISK_COLORS.moderate },
    { name: 'High Risk', value: highRiskCount, color: RISK_COLORS.high },
  ];

  const hasFinancialData = financialMetrics && financialMetrics.claimsWithFinancialData > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Probability Distribution + Risk Pie Chart */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Probability Distribution Chart */}
        <div className="border rounded-md p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <h4 className="text-sm font-semibold text-foreground mb-4">Probability Distribution</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="bucket"
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: 'var(--color-muted)' }}
                  wrapperStyle={{ outline: 'none' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    color: 'var(--color-foreground)',
                    fontSize: '0.75rem',
                  }}
                  formatter={(value: number) => [`${value} claim${value === 1 ? '' : 's'}`, 'Count']}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Pie Chart */}
        <div className="border rounded-md p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <h4 className="text-sm font-semibold text-foreground mb-4">Risk Classification</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="var(--color-primary)"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                  }}
                  labelStyle={{ color: 'var(--color-foreground)', marginBottom: '4px' }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                  formatter={(value: number) => [`${value} claims`, 'Count']}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    color: 'var(--color-muted-foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Horizontal Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 [&>div]:min-w-0">
        {/* Total Evaluated Claims */}
        <div className="border rounded-md p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Total Claims
          </p>
          <p className="truncate text-2xl font-semibold text-foreground font-mono">{total}</p>
        </div>

        {/* Average Score */}
        <div className="border rounded-md p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Avg Score
          </p>
          <p className="truncate text-2xl font-semibold text-foreground font-mono">{averageScore.toFixed(3)}</p>
        </div>

        {/* Average Probability */}
        <div className="border rounded-md p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Avg Probability
          </p>
          <p className="truncate text-2xl font-semibold text-foreground font-mono">
            {(averageProbability * 100).toFixed(1)}%
          </p>
        </div>

        {/* Total Claimed Value */}
        {isLoadingMetrics && (
          <div className="border rounded-md p-3 flex items-center justify-center col-span-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
            <p className="text-xs text-muted-foreground">Loading financial metrics...</p>
          </div>
        )}
        {hasFinancialData && !isLoadingMetrics && (
          <>
            <div className="border rounded-md p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Total Value
              </p>
              <p
                className="truncate text-2xl font-semibold text-foreground font-mono"
                title={formatCurrency(financialMetrics.totalClaimedValue)}
              >
                {formatCurrency(financialMetrics.totalClaimedValue)}
              </p>
            </div>

            <div className="border rounded-md p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Avg Value
              </p>
              <p
                className="truncate text-2xl font-semibold text-foreground font-mono"
                title={formatCurrency(financialMetrics.averageClaimValue)}
              >
                {formatCurrency(financialMetrics.averageClaimValue)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Row 3: Financial Analytics Charts */}
      {hasFinancialData && !isLoadingMetrics && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Value by Risk Level */}
          <div className="border rounded-md p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
            <h4 className="text-sm font-semibold text-foreground mb-4">Value by Risk Level</h4>
            <ValueByRiskChart valueByRisk={financialMetrics.valueByRisk} />
          </div>

          {/* Price Distribution: High Risk vs STP */}
          <div className="border rounded-md p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Price Distribution: High Risk vs STP
            </h4>
            <PriceDistributionHistogram priceDistribution={financialMetrics.priceDistribution} />
          </div>
        </div>
      )}
    </div>
  );
}
