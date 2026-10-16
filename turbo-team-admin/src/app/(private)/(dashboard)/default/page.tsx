import { DailyRevenueForm } from './_components/daily-revenue-form';

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="mx-auto w-full max-w-2xl">
        <DailyRevenueForm />
      </div>
    </div>
  );
}
