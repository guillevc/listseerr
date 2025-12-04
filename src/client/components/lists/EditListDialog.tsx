import { useState, useEffect } from 'react';
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
import { useToast } from '../../hooks/use-toast';
import { trpc } from '../../lib/trpc';
import type { SerializedMediaList } from '@/shared/types';

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

  // Reset form when dialog opens or list changes
  useEffect(() => {
    if (open) {
      setName(list.name);
      setMaxItems(list.maxItems?.toString() || '20');
    }
  }, [open, list]);

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
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
          <DialogDescription>
            Update list name and max items. URL cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">List Name</Label>
            <Input
              id="edit-name"
              placeholder="My List"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-url">List URL (Read-only)</Label>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md break-all">
              {list.url}
            </div>
            <p className="text-xs text-muted-foreground">
              URL cannot be changed. Create a new list if you need a different URL.
            </p>
          </div>
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
            <p className="text-xs text-muted-foreground">
              Maximum number of items to fetch from the list (1-50). Default: 20
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
