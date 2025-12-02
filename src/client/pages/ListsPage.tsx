import { RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ListsHeader } from '../components/lists/ListsHeader';
import { ListStats } from '../components/lists/ListStats';
import { ListsTable } from '../components/lists/ListsTable';
import { trpc } from '../lib/trpc';
import { useListProcessor } from '../hooks/use-list-processor';

export function ListsPage() {
  const { data: lists = [], isLoading: listsLoading } = trpc.lists.getAll.useQuery();
  const { processingLists, handleProcess, handleProcessAll, jellyseerrConfig } = useListProcessor();

  if (listsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration Alert */}
      {!jellyseerrConfig && (
        <Card className="border-flexoki-orange bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-flexoki-orange">
              <AlertCircle className="h-5 w-5" />
              Configuration Required
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please configure your Jellyseerr instance in Settings to start processing lists.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Header with Actions */}
      <ListsHeader
        onProcessAll={() => handleProcessAll(lists)}
        processingLists={processingLists}
        hasLists={lists.length > 0}
        jellyseerrConfigured={!!jellyseerrConfig}
      />

      {/* Stats */}
      {lists.length > 0 && (
        <ListStats lists={lists} />
      )}

      {/* Lists Table or Empty State */}
      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No lists added yet</p>
              <p className="text-sm">
                Add lists to automatically request new content to Jellyseerr
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ListsTable
            lists={lists}
            onProcess={(id) => handleProcess(id, lists)}
            processingLists={processingLists}
          />
        </motion.div>
      )}
    </div>
  );
}
