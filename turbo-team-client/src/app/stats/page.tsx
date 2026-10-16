import { RevenueTrend } from './_components/revenue-trend';

export default function StatsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <RevenueTrend />
    </div>
  );
}
