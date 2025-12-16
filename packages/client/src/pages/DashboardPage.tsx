import { RefreshCw } from 'lucide-react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { trpc } from '../lib/trpc';

export function DashboardPage() {
  const { data, isLoading } = trpc.lists.getAll.useQuery();
  const lists = data?.lists ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted">Overview of your media lists and request activity</p>
      </div>

      <DashboardStats lists={lists} />
      <RecentActivity />
    </div>
  );
}
