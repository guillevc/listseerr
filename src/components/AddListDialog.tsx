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
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MediaList } from '../types';
import { validateAndDetectProvider, getProviderName } from '../lib/url-validator';
import { useToast } from '../hooks/use-toast';

interface Props {
  onAdd: (list: Omit<MediaList, 'id'>) => void;
}

export function AddListDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      const result = validateAndDetectProvider(value);
      if (!result.isValid) {
        setUrlError(result.error || 'Invalid URL');
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
    if (!result.isValid || !result.provider) {
      toast({
        title: 'Error',
        description: result.error || 'Invalid URL',
        variant: 'destructive',
      });
      return;
    }

    onAdd({
      name: name.trim(),
      url: url.trim(),
      provider: result.provider,
      enabled: true,
    });

    toast({
      title: 'List Added',
      description: `${name} (${getProviderName(result.provider)}) has been added successfully`,
    });

    setName('');
    setUrl('');
    setUrlError(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New List</DialogTitle>
          <DialogDescription>
            Add a list from Trakt, Letterboxd, MDBList, IMDB, or TheMovieDB.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              placeholder="My Watchlist"
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
                Valid {getProviderName(validateAndDetectProvider(url).provider!)} URL detected
              </p>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported URL formats:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Trakt: https://trakt.tv/users/USER/lists/LIST</li>
              <li>Letterboxd: https://letterboxd.com/USER/list/LIST/</li>
              <li>MDBList: https://mdblist.com/lists/USER/LIST</li>
              <li>IMDB: https://www.imdb.com/list/ls123456/</li>
              <li>TheMovieDB: https://www.themoviedb.org/list/123</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Add List</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
