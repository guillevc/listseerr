import { useState } from 'react';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { validateAndDetectProvider } from '../../lib/url-validator';
import { useToast } from '../../hooks/use-toast';
import { trpc } from '../../lib/trpc';

export function AddListDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [maxItems, setMaxItems] = useState('20');
  const [provider, setProvider] = useState<'trakt' | 'mdblist'>('trakt');
  const [urlError, setUrlError] = useState<string | null>(null);
  const { toast } = useToast();

  const utils = trpc.useUtils();

  // Query provider configs for status indicators
  const { data: traktConfig } = trpc.providerConfig.getTraktConfig.useQuery();
  const { data: mdbListConfig } = trpc.providerConfig.getMdbListConfig.useQuery();

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
      if (!result.isValid || result.provider !== provider) {
        setUrlError(`Please enter a valid ${provider === 'trakt' ? 'Trakt.tv' : 'MDBList'} list URL`);
      } else {
        setUrlError(null);
      }
    } else {
      setUrlError(null);
    }
  };

  const handleProviderChange = (newProvider: 'trakt' | 'mdblist') => {
    setProvider(newProvider);
    // Re-validate URL if one exists
    if (url) {
      const result = validateAndDetectProvider(url);
      if (!result.isValid || result.provider !== newProvider) {
        setUrlError(`Please enter a valid ${newProvider === 'trakt' ? 'Trakt.tv' : 'MDBList'} list URL`);
      } else {
        setUrlError(null);
      }
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

    // Check if provider is configured
    const isConfigured = provider === 'trakt'
      ? !!traktConfig?.clientId
      : !!mdbListConfig?.apiKey;

    const result = validateAndDetectProvider(url);
    if (!result.isValid || result.provider !== provider) {
      toast({
        title: 'Error',
        description: `Please enter a valid ${provider === 'trakt' ? 'Trakt.tv' : 'MDBList'} list URL`,
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
      provider: provider,
      enabled: isConfigured, // Only enable if provider is configured
      maxItems: maxItemsNum,
    });

    // Show info message if provider not configured
    if (!isConfigured) {
      setTimeout(() => {
        toast({
          title: 'List Added as Disabled',
          description: `The list was added but is disabled because ${provider === 'trakt' ? 'Trakt' : 'MDBList'} is not configured. Configure the provider in Settings → API Keys to enable processing.`,
        });
      }, 500);
    }
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
            Add a public list from Trakt.tv or MDBList to automatically request media to Jellyseerr.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Provider Selection */}
          <div className="grid gap-3">
            <Label>Provider</Label>
            <RadioGroup value={provider} onValueChange={handleProviderChange}>
              <label className="block cursor-pointer">
                <RadioGroupItem value="trakt" id="provider-trakt" className="peer sr-only" />
                <div className="flex items-center gap-4 rounded-lg border-2 border-muted p-4 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/20 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Trakt.tv</p>
                        <p className="text-xs text-muted-foreground">Public lists and watchlists</p>
                      </div>
                      {traktConfig?.clientId ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-500 text-white">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Configured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </label>

              <label className="block cursor-pointer">
                <RadioGroupItem value="mdblist" id="provider-mdblist" className="peer sr-only" />
                <div className="flex items-center gap-4 rounded-lg border-2 border-muted p-4 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/20 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">MDBList</p>
                        <p className="text-xs text-muted-foreground">Public and custom lists</p>
                      </div>
                      {mdbListConfig?.apiKey ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-500 text-white">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Configured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            </RadioGroup>
          </div>

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
                Valid {provider === 'trakt' ? 'Trakt.tv' : 'MDBList'} URL detected
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
            <p className="text-sm font-medium">
              {provider === 'trakt' ? 'Trakt.tv' : 'MDBList'} URL format:
            </p>
            <div className="space-y-1.5 text-sm">
              {provider === 'trakt' ? (
                <>
                  <code className="text-xs bg-background px-1.5 py-0.5 rounded block">
                    https://trakt.tv/users/USERNAME/lists/LIST-SLUG
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Example: https://trakt.tv/users/hdlists/lists/sci-fi-movies
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Tip:</strong> Query parameters for sorting are supported (e.g., ?sort=rank to sort by ranking)
                  </p>
                </>
              ) : (
                <>
                  <code className="text-xs bg-background px-1.5 py-0.5 rounded block">
                    https://mdblist.com/lists/USERNAME/LIST-SLUG
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Example: https://mdblist.com/lists/linaspurinis/most-popular-movies-top-20
                  </p>
                </>
              )}
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
