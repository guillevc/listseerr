import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { Skeleton } from '../components/ui/skeleton';
import { trpc } from '../lib/trpc';

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg md:col-span-2" />
      </div>
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading } = trpc.lists.getAll.useQuery();
  const lists = data?.lists ?? [];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted">Overview of your lists and activity</p>
      </div>

      <DashboardStats lists={lists} />
      <RecentActivity />
    </div>
  );
}
