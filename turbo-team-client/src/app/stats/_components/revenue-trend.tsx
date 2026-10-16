'use client';

import { toPng } from 'html-to-image';
import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';
import { BarChart3, Download, TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getWeekComparison, getWeekStats } from '@/services/stats';
import type { EventImpact, MetricComparison, WeekDayStats } from '@/types';

const COLORS = {
  pos: '#2b2b2b',
  eatclub: '#4f6df5',
  labour: '#f97316',
  prevPos: '#cfcfcf',
  prevEatclub: '#c9d6fb',
  prevLabour: '#f8c9a8',
};

type SeriesKey = 'pos' | 'eatclub' | 'labour';

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;

const formatAxis = (value: number) => {
  if (value === 0) return '0k';

  return `${value / 1000}k`;
};

function EventImpactIcon({ impact }: { impact: EventImpact }) {
  if (impact === 'positive') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100">
        <TrendingUp className="size-3.5" />
      </span>
    );
  }

  if (impact === 'negative') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-100">
        <TrendingDown className="size-3.5" />
      </span>
    );
  }

  return null;
}

function EventImpactLabel(props: LabelProps) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const value = props.value as EventImpact | undefined;

  if (!value) return null;

  return (
    <foreignObject x={x + width / 2 - 60} y={y - 40} width={24} height={24}>
      <EventImpactIcon impact={value} />
    </foreignObject>
  );
}

function SeriesToggle({
  checked,
  color,
  label,
  onChange,
}: {
  checked: boolean;
  color: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-neutral-300 accent-neutral-900"
      />
      <span className="h-[2px] w-4 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </label>
  );
}

function SummaryCard({
  label,
  value,
  comparison,
  formatValue,
}: {
  label: string;
  value: number;
  comparison?: MetricComparison;
  formatValue: (value: number) => string;
}) {
  const isPositive = (comparison?.percentChange ?? 0) >= 0;

  return (
    <div className="rounded-2xl bg-neutral-50 px-5 py-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight text-neutral-900">
          {formatValue(value)}
        </p>
        {comparison ? (
          <p className="text-sm text-neutral-500">
            vs {formatValue(comparison.previous)}{' '}
            <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
              ({isPositive ? '+' : ''}
              {comparison.percentChange}%)
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number; color?: string; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="mb-1 font-medium text-neutral-900">{label}</p>
      {payload
        .filter((item) => item.dataKey !== 'eventAnchor')
        .map((item) => (
          <p key={String(item.dataKey)} className="flex items-center gap-2 text-neutral-600">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}: {formatCurrency(Number(item.value ?? 0))}
          </p>
        ))}
    </div>
  );
}

export function RevenueTrend() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [comparing, setComparing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    pos: true,
    eatclub: true,
    labour: true,
  });

  const weekQuery = useQuery({
    queryKey: ['stats-week'],
    queryFn: getWeekStats,
  });

  const compareQuery = useQuery({
    queryKey: ['stats-week-compare'],
    queryFn: getWeekComparison,
    enabled: comparing,
  });

  const current = comparing ? compareQuery.data?.current : weekQuery.data;
  const previous = comparing ? compareQuery.data?.previous : undefined;
  const comparison = comparing ? compareQuery.data?.comparison : undefined;
  const isLoading = comparing ? compareQuery.isFetching : weekQuery.isFetching;

  const chartData = useMemo(() => {
    const days = current?.days ?? [];
    const previousByDay = new Map((previous?.days ?? []).map((day) => [day.dayOfWeek, day]));

    return days.map((day: WeekDayStats) => {
      const prev = previousByDay.get(day.dayOfWeek);
      const currentVisibleTotal =
        (visible.pos ? day.posRevenue : 0) + (visible.eatclub ? day.eatclubRevenue : 0);
      const previousVisibleTotal =
        (visible.pos ? (prev?.posRevenue ?? 0) : 0) +
        (visible.eatclub ? (prev?.eatclubRevenue ?? 0) : 0);

      return {
        day: day.dayOfWeek,
        posRevenue: visible.pos ? day.posRevenue : 0,
        eatclubRevenue: visible.eatclub ? day.eatclubRevenue : 0,
        labourCosts: visible.labour ? day.labourCosts : 0,
        prevPosRevenue: visible.pos ? (prev?.posRevenue ?? 0) : 0,
        prevEatclubRevenue: visible.eatclub ? (prev?.eatclubRevenue ?? 0) : 0,
        prevLabourCosts: visible.labour ? (prev?.labourCosts ?? 0) : 0,
        eventImpact: day.eventImpact,
        eventAnchor: Math.max(
          currentVisibleTotal,
          visible.labour ? day.labourCosts : 0,
          previousVisibleTotal,
          visible.labour ? (prev?.labourCosts ?? 0) : 0,
        ),
      };
    });
  }, [current, previous, visible]);

  const handleExport = async () => {
    if (!cardRef.current) return;

    try {
      setExporting(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = 'revenue-trend.png';
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const handleCompare = () => {
    setComparing((value) => !value);
  };

  return (
    <div
      ref={cardRef}
      className="max-w-8xl mx-auto rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="max-w-xs text-xl font-semibold leading-snug text-neutral-900">
          {comparing ? "This Week's Revenue Trend vs Previous Period" : "This Week's Revenue Trend"}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <SeriesToggle
            checked={visible.pos}
            color={COLORS.pos}
            label="POS Revenue"
            onChange={(checked) => setVisible((state) => ({ ...state, pos: checked }))}
          />
          <SeriesToggle
            checked={visible.eatclub}
            color={COLORS.eatclub}
            label="Eatclub Revenue"
            onChange={(checked) => setVisible((state) => ({ ...state, eatclub: checked }))}
          />
          <SeriesToggle
            checked={visible.labour}
            color={COLORS.labour}
            label="Labour Costs"
            onChange={(checked) => setVisible((state) => ({ ...state, labour: checked }))}
          />
          <button
            type="button"
            onClick={handleCompare}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm',
              comparing ? 'bg-neutral-900 text-white' : 'bg-amber-300 text-neutral-900',
            )}
          >
            <BarChart3 className="size-4" />
            Compare to Previous
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm"
          >
            <Download className="size-4" />
            Export PNG
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total Revenue"
          value={current?.summary.totalRevenue ?? 0}
          comparison={comparison?.totalRevenue}
          formatValue={formatCurrency}
        />
        <SummaryCard
          label="Average per Day"
          value={current?.summary.averagePerDay ?? 0}
          comparison={comparison?.averagePerDay}
          formatValue={formatCurrency}
        />
        <SummaryCard
          label="Total Covers"
          value={current?.summary.totalCovers ?? 0}
          comparison={comparison?.totalCovers}
          formatValue={(value) => Math.round(value).toLocaleString('en-US')}
        />
      </div>

      <div className="mt-6 h-[360px]">
        {isLoading && !current ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2} barCategoryGap="10%">
              <CartesianGrid vertical={false} stroke="#ececec" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#737373', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxis}
                tick={{ fill: '#737373', fontSize: 12 }}
                domain={[0, 3000]}
                ticks={[0, 750, 1500, 2250, 3000]}
              />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<ChartTooltipContent />} />
              {visible.pos ? (
                <Bar
                  dataKey="posRevenue"
                  name={comparing ? 'POS Revenue (Current)' : 'POS Revenue'}
                  fill={COLORS.pos}
                  stackId="current"
                  maxBarSize={55}
                  radius={visible.eatclub ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                />
              ) : null}
              {visible.eatclub ? (
                <Bar
                  dataKey="eatclubRevenue"
                  name={comparing ? 'Eatclub Revenue (Current)' : 'Eatclub Revenue'}
                  fill={COLORS.eatclub}
                  stackId="current"
                  maxBarSize={55}
                  radius={[6, 6, 0, 0]}
                />
              ) : null}
              {visible.labour ? (
                <Bar
                  dataKey="labourCosts"
                  name={comparing ? 'Labour Costs (Current)' : 'Labour Costs'}
                  fill={COLORS.labour}
                  stackId="currentLabour"
                  maxBarSize={55}
                  radius={[6, 6, 0, 0]}
                />
              ) : null}
              {comparing && visible.pos ? (
                <Bar
                  dataKey="prevPosRevenue"
                  name="Direct Revenue (Previous)"
                  fill={COLORS.prevPos}
                  stackId="previous"
                  maxBarSize={55}
                  radius={visible.eatclub ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                />
              ) : null}
              {comparing && visible.eatclub ? (
                <Bar
                  dataKey="prevEatclubRevenue"
                  name="Total Revenue (Previous)"
                  fill={COLORS.prevEatclub}
                  stackId="previous"
                  maxBarSize={55}
                  radius={[6, 6, 0, 0]}
                />
              ) : null}
              {comparing && visible.labour ? (
                <Bar
                  dataKey="prevLabourCosts"
                  name="Labour Costs (Previous)"
                  fill={COLORS.prevLabour}
                  stackId="previousLabour"
                  maxBarSize={55}
                  radius={[6, 6, 0, 0]}
                />
              ) : null}
              <Bar
                dataKey="eventAnchor"
                fill="transparent"
                legendType="none"
                isAnimationActive={false}
                maxBarSize={55}
              >
                <LabelList dataKey="eventImpact" content={EventImpactLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-neutral-600">
        <LegendSwatch
          color={COLORS.pos}
          label={comparing ? 'POS Revenue (Current)' : 'POS Revenue'}
        />
        <LegendSwatch
          color={COLORS.eatclub}
          label={comparing ? 'Eatclub Revenue (Current)' : 'Eatclub Revenue'}
        />
        <LegendSwatch
          color={COLORS.labour}
          label={comparing ? 'Labour Costs (Current)' : 'Labour Costs'}
        />
        {comparing ? (
          <>
            <LegendSwatch color={COLORS.prevPos} label="Direct Revenue (Previous)" />
            <LegendSwatch color={COLORS.prevEatclub} label="Total Revenue (Previous)" />
            <LegendSwatch color={COLORS.prevLabour} label="Labour Costs (Previous)" />
          </>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <EventImpactIcon impact="positive" />
          Positive Event Impact
        </span>
        <span className="inline-flex items-center gap-1.5">
          <EventImpactIcon impact="negative" />
          Negative Event Impact
        </span>
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
