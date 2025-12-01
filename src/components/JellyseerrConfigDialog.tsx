import { useState, useEffect } from 'react';
import { Settings, CheckCircle2 } from 'lucide-react';
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
import { JellyseerrConfig } from '../types';
import { JellyseerrService } from '../services/jellyseerr';
import { useToast } from '../hooks/use-toast';

interface Props {
  config: JellyseerrConfig | null;
  onSave: (config: JellyseerrConfig) => void;
}

export function JellyseerrConfigDialog({ config, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(config?.url || '');
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [userId, setUserId] = useState(config?.userId.toString() || '');
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens or config changes
  useEffect(() => {
    if (open) {
      setUrl(config?.url || '');
      setApiKey(config?.apiKey || '');
      setUserId(config?.userId.toString() || '');
    }
  }, [open, config]);

  const handleTest = async () => {
    if (!url || !apiKey) {
      toast({
        title: 'Error',
        description: 'Please fill in URL and API Key',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    const service = new JellyseerrService({ url, apiKey, userId: parseInt(userId) || 0 });
    const result = await service.testConnection();
    setTesting(false);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Connection successful!',
      });
    } else {
      toast({
        title: 'Connection Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    if (!url || !apiKey || !userId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      url: url.trim(),
      apiKey: apiKey.trim(),
      userId: parseInt(userId),
    });

    toast({
      title: 'Saved',
      description: 'Jellyseerr configuration saved successfully',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={config ? "default" : "outline"}
          size="sm"
          className={config ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {config ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Jellyseerr Configured
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Configure Jellyseerr
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Jellyseerr Configuration</DialogTitle>
          <DialogDescription>
            {config
              ? 'Update your Jellyseerr instance configuration.'
              : 'Configure your Jellyseerr instance to enable automatic media requests.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">Jellyseerr URL</Label>
            <Input
              id="url"
              placeholder="https://jellyseerr.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="number"
              placeholder="1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
