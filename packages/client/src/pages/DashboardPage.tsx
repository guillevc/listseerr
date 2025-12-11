import { RefreshCw } from 'lucide-react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { Card, CardContent } from '../components/ui/card';
import { trpc } from '../lib/trpc';

export function DashboardPage() {
  const { data, isLoading } = trpc.lists.getAll.useQuery();
  const lists = data?.lists ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted mt-1">
          Overview of your media lists and sync activity
        </p>
      </div>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted">
              <p className="text-lg mb-2">Welcome to Listseerr!</p>
              <p className="text-sm">
                Get started by adding your first media list from the Lists page.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <DashboardStats lists={lists} />
          <RecentActivity />
        </>
      )}
    </div>
  );
}
