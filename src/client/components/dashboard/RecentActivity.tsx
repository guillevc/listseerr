import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Activity } from 'lucide-react';

export function RecentActivity() {
  // Placeholder component - will be populated with actual activity data later
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Recent list processing and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>No recent activity</p>
          <p className="text-sm mt-1">Processing activity will appear here</p>
        </div>
      </CardContent>
    </Card>
  );
}
