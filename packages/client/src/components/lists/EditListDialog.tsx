import { useReducer } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { trpc } from '../../lib/trpc';
import type { SerializedMediaList } from 'shared/application/dtos';
import {
  TraktChartTypeValues,
  TraktMediaTypeValues,
  type TraktChartType,
  type TraktMediaType,
} from 'shared/domain/types';
import { isTraktChart, isStevenLu } from 'shared/domain/logic';
import { TraktChartDisplayNames } from 'shared/domain/logic';
import { parseTraktChartUrl } from 'shared/domain/logic';
import { listNameSchema, maxItemsSchema } from 'shared/presentation/schemas';

interface EditListDialogProps {
  list: SerializedMediaList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditFormState {
  name: string;
  maxItems: string;
  seerrUserIdOverride: string;
  selectedMediaType: TraktMediaType;
  selectedChartType: TraktChartType;
}

type EditFormAction =
  | {
      type: 'RESET';
      list: SerializedMediaList;
      parsedChartInfo: { mediaType: TraktMediaType; chartType: TraktChartType };
    }
  | { type: 'SET_FIELD'; field: keyof EditFormState; value: string };

function editFormReducer(state: EditFormState, action: EditFormAction): EditFormState {
  switch (action.type) {
    case 'RESET':
      return {
        name: action.list.name,
        maxItems: action.list.maxItems?.toString() || '20',
        seerrUserIdOverride: action.list.seerrUserIdOverride?.toString() || '',
        selectedMediaType: action.parsedChartInfo.mediaType,
        selectedChartType: action.parsedChartInfo.chartType,
      };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
  }
}

export function EditListDialog({ list, open, onOpenChange }: EditListDialogProps) {
  // Parse traktChart URL to extract media type and chart type
  const parsedChartInfo = (() => {
    if (isTraktChart(list.provider)) {
      const url = list.displayUrl || list.url;
      const parsed = parseTraktChartUrl(url);

      if (parsed) {
        return {
          mediaType: parsed.mediaType,
          chartType: parsed.chartType,
        };
      }
    }
    return {
      mediaType: TraktMediaTypeValues.MOVIES,
      chartType: TraktChartTypeValues.TRENDING,
    };
  })();

  const [state, dispatch] = useReducer(editFormReducer, {
    name: list.name,
    maxItems: list.maxItems?.toString() || '20',
    seerrUserIdOverride: list.seerrUserIdOverride?.toString() || '',
    selectedMediaType: parsedChartInfo.mediaType,
    selectedChartType: parsedChartInfo.chartType,
  });

  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Reset form when dialog state changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      dispatch({ type: 'RESET', list, parsedChartInfo });
    }
    onOpenChange(newOpen);
  };

  const updateMutation = trpc.lists.update.useMutation({
    onSuccess: () => {
      void utils.lists.getAll.invalidate();
      void utils.dashboard.getStats.invalidate();
      toast({
        title: 'List Updated',
        description: 'Changes saved successfully',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  const isSaving = useMinLoading(updateMutation.isPending);

  const handleSave = () => {
    // Validate name using shared schema
    const nameResult = listNameSchema.safeParse(state.name);
    if (!nameResult.success) {
      const firstIssue = nameResult.error.issues[0];
      toast({
        title: 'Error',
        description: firstIssue?.message ?? 'Invalid name',
        variant: 'destructive',
      });
      return;
    }

    // Validate maxItems using shared schema
    const maxItemsNum = parseInt(state.maxItems);
    const maxItemsResult = maxItemsSchema.safeParse(maxItemsNum);
    if (!maxItemsResult.success) {
      const firstIssue = maxItemsResult.error.issues[0];
      toast({
        title: 'Error',
        description: firstIssue?.message ?? 'Invalid max items',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate({
      id: list.id,
      data: {
        name: nameResult.data, // Use validated & trimmed name
        maxItems: maxItemsResult.data, // Use validated maxItems
        seerrUserIdOverride: state.seerrUserIdOverride ? parseInt(state.seerrUserIdOverride) : null,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
          <DialogDescription>Update list settings</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="min-h-[350px] space-y-4">
            {/* List Name - ALWAYS FIRST */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">List Name</Label>
              <Input
                id="edit-name"
                placeholder="My List"
                value={state.name}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })
                }
              />
            </div>

            {/* Media Type and Chart Type fields for Trakt Chart (READ-ONLY) */}
            {isTraktChart(list.provider) && (
              <>
                {/* Media Type Selection (Read-only) */}
                <div className="grid gap-2">
                  <Label>Media Type (Read-only)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        state.selectedMediaType === TraktMediaTypeValues.MOVIES
                          ? 'default'
                          : 'outline'
                      }
                      className="flex-1 cursor-not-allowed opacity-60"
                      disabled
                    >
                      Movies
                    </Button>
                    <Button
                      type="button"
                      variant={
                        state.selectedMediaType === TraktMediaTypeValues.SHOWS
                          ? 'default'
                          : 'outline'
                      }
                      className="flex-1 cursor-not-allowed opacity-60"
                      disabled
                    >
                      Shows
                    </Button>
                  </div>
                  <p className="text-xs text-muted">
                    Media type cannot be changed. Create a new list if you need a different type.
                  </p>
                </div>

                {/* Chart Type Dropdown (Read-only) */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-chartType">Chart Type (Read-only)</Label>
                  <Select value={state.selectedChartType} disabled>
                    <SelectTrigger className="cursor-not-allowed opacity-60">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TraktChartDisplayNames).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted">
                    Chart type cannot be changed. Create a new list if you need a different chart.
                  </p>
                </div>
              </>
            )}

            {/* URL field for Trakt List and MDBList only (Read-only) */}
            {!isTraktChart(list.provider) && !isStevenLu(list.provider) && (
              <div className="grid gap-2">
                <Label htmlFor="edit-url">List URL (Read-only)</Label>
                <div className="rounded-md bg-light-ui p-2 text-sm break-all text-muted dark:bg-dark-ui">
                  {list.displayUrl || list.url}
                </div>
                <p className="text-xs text-muted">
                  URL cannot be changed. Create a new list if you need a different URL.
                </p>
              </div>
            )}

            {/* Max Items */}
            <div className="grid gap-2">
              <Label htmlFor="edit-maxItems">Max Items</Label>
              <Input
                id="edit-maxItems"
                type="number"
                placeholder="20"
                value={state.maxItems}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'maxItems', value: e.target.value })
                }
                min="1"
                max="500"
                required
              />
              <p className="text-xs text-muted">Items to fetch (1-500). Default: 20</p>
            </div>

            {/* Seerr User ID Override */}
            <div className="grid gap-2">
              <Label htmlFor="edit-seerrUserIdOverride">Seerr User ID Override</Label>
              <Input
                id="edit-seerrUserIdOverride"
                type="number"
                placeholder="Leave empty to use global setting"
                value={state.seerrUserIdOverride}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'seerrUserIdOverride',
                    value: e.target.value,
                  })
                }
                min="1"
              />
              <p className="text-xs text-muted">Override the global Seerr user ID for this list</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
