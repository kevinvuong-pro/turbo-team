'use client';

import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';

import { RevenueTrend } from './_components/revenue-trend';

export default function StatsPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!statsRef.current) return;

    try {
      setExporting(true);
      const dataUrl = await toPng(statsRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = 'stats.png';
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      ref={statsRef}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <RevenueTrend exporting={exporting} onExport={handleExport} />
    </div>
  );
}
