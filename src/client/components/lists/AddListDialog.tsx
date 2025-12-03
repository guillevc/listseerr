import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { validateAndDetectProvider } from '../../lib/url-validator';
import { useToast } from '../../hooks/use-toast';
import { trpc } from '../../lib/trpc';

export function AddListDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [maxItems, setMaxItems] = useState('20');
  const [urlError, setUrlError] = useState<string | null>(null);
  const { toast } = useToast();

  const utils = trpc.useUtils();

  const createMutation = trpc.lists.create.useMutation({
    onSuccess: (newList) => {
      // Invalidate all related queries
      utils.lists.getAll.invalidate();
      utils.dashboard.getStats.invalidate();

      toast({
        title: 'List Added',
        description: `${newList.name} has been added successfully`,
      });

      setName('');
      setUrl('');
      setMaxItems('20');
      setUrlError(null);
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      const result = validateAndDetectProvider(value);
      if (!result.isValid || result.provider !== 'trakt') {
        setUrlError('Please enter a valid Trakt.tv list URL');
      } else {
        setUrlError(null);
      }
    } else {
      setUrlError(null);
    }
  };

  const handleAdd = () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a list name',
        variant: 'destructive',
      });
      return;
    }

    const result = validateAndDetectProvider(url);
    if (!result.isValid || result.provider !== 'trakt') {
      toast({
        title: 'Error',
        description: 'Please enter a valid Trakt.tv list URL',
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

    createMutation.mutate({
      name: name.trim(),
      url: url.trim(),
      provider: 'trakt',
      enabled: true,
      maxItems: maxItemsNum,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New List</DialogTitle>
          <DialogDescription>
            Add a public list from Trakt.tv to automatically request media to Jellyseerr.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              placeholder="My List"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">List URL</Label>
            <Input
              id="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={urlError ? 'border-red-500' : ''}
            />
            {urlError && (
              <p className="text-sm text-red-500">{urlError}</p>
            )}
            {!urlError && url && (
              <p className="text-sm text-green-500">
                Valid Trakt.tv URL detected
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxItems">Max Items</Label>
            <Input
              id="maxItems"
              type="number"
              placeholder="20"
              value={maxItems}
              onChange={(e) => setMaxItems(e.target.value)}
              min="1"
              max="50"
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of items to fetch from the list (1-50). Default: 20
            </p>
          </div>
          <div className="rounded-md border bg-muted/50 p-3 space-y-2">
            <p className="text-sm font-medium">Trakt.tv URL format:</p>
            <div className="space-y-1.5 text-sm">
              <code className="text-xs bg-background px-1.5 py-0.5 rounded block">
                https://trakt.tv/users/USERNAME/lists/LIST-SLUG
              </code>
              <p className="text-xs text-muted-foreground">
                Example: https://trakt.tv/users/hdlists/lists/sci-fi-movies
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding...' : 'Add List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
