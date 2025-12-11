import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { trpc } from '../../lib/trpc';
import type { SerializedMediaList } from '@/shared/application/dtos/core/media-list.dto';

interface EditListDialogProps {
  list: SerializedMediaList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditListDialog({ list, open, onOpenChange }: EditListDialogProps) {
  const [name, setName] = useState(list.name);
  const [maxItems, setMaxItems] = useState(list.maxItems?.toString() || '20');
  const { toast } = useToast();

  const utils = trpc.useUtils();

  // Parse traktChart URL to extract media type and chart type
  const parsedChartInfo = useMemo(() => {
    if (list.provider === 'traktChart') {
      const url = list.displayUrl || list.url;
      // URL format: https://trakt.tv/movies/trending or https://trakt.tv/shows/popular
      const urlPattern = /https?:\/\/(www\.)?(api\.)?trakt\.tv\/(movies|shows)\/(trending|popular|favorited|played|watched|collected|anticipated)/i;
      const match = url.match(urlPattern);

      if (match) {
        return {
          mediaType: match[3] as 'movies' | 'shows',
          chartType: match[4].toLowerCase()
        };
      }
    }
    return { mediaType: 'movies' as const, chartType: 'trending' };
  }, [list]);

  const [selectedMediaType, setSelectedMediaType] = useState<'movies' | 'shows'>(parsedChartInfo.mediaType);
  const [selectedChartType, setSelectedChartType] = useState<string>(parsedChartInfo.chartType);

  // Reset form when dialog state changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form when opening
      setName(list.name);
      setMaxItems(list.maxItems?.toString() || '20');
      setSelectedMediaType(parsedChartInfo.mediaType);
      setSelectedChartType(parsedChartInfo.chartType);
    }
    onOpenChange(newOpen);
  };

  const updateMutation = trpc.lists.update.useMutation({
    onSuccess: () => {
      utils.lists.getAll.invalidate();
      utils.dashboard.getStats.invalidate();
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

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a list name',
        variant: 'destructive',
      });
      return;
    }

    const maxItemsNum = parseInt(maxItems);
    if (isNaN(maxItemsNum) || maxItemsNum < 1 || maxItemsNum > 50) {
      toast({
        title: 'Error',
        description: 'Max items must be between 1 and 50',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate({
      id: list.id,
      data: {
        name: name.trim(),
        maxItems: maxItemsNum,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
          <DialogDescription>
            Update list settings
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4 min-h-[350px]">
            {/* List Name - ALWAYS FIRST */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">List Name</Label>
              <Input
                id="edit-name"
                placeholder="My List"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Media Type and Chart Type fields for Trakt Chart (READ-ONLY) */}
            {list.provider === 'traktChart' && (
              <>
                {/* Media Type Selection (Read-only) */}
                <div className="grid gap-2">
                  <Label>Media Type (Read-only)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={selectedMediaType === 'movies' ? 'default' : 'outline'}
                      className="flex-1 cursor-not-allowed opacity-60"
                      disabled
                    >
                      Movies
                    </Button>
                    <Button
                      type="button"
                      variant={selectedMediaType === 'shows' ? 'default' : 'outline'}
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
                  <Select value={selectedChartType} disabled>
                    <SelectTrigger className="cursor-not-allowed opacity-60">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="favorited">Most Favorited</SelectItem>
                      <SelectItem value="played">Most Played</SelectItem>
                      <SelectItem value="watched">Most Watched</SelectItem>
                      <SelectItem value="collected">Most Collected</SelectItem>
                      <SelectItem value="anticipated">Most Anticipated</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted">
                    Chart type cannot be changed. Create a new list if you need a different chart.
                  </p>
                </div>
              </>
            )}

            {/* URL field for Trakt List and MDBList only (Read-only) */}
            {list.provider !== 'traktChart' && list.provider !== 'stevenlu' && (
              <div className="grid gap-2">
                <Label htmlFor="edit-url">List URL (Read-only)</Label>
                <div className="text-sm text-muted bg-light-ui dark:bg-dark-ui p-2 rounded-md break-all">
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
                value={maxItems}
                onChange={(e) => setMaxItems(e.target.value)}
                min="1"
                max="50"
                required
              />
              <p className="text-xs text-muted">
                Maximum number of items to fetch from the list (1-50). Default: 20
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
