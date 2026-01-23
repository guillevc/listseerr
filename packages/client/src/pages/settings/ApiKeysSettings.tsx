import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { ProviderConfigCard } from '../../components/settings/ProviderConfigCard';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { handleValidationResult, createMutationCallbacks } from '../../lib/toast-helpers';
import { traktClientIdSchema, mdblistApiKeySchema } from 'shared/presentation/schemas';

export function ApiKeysSettings() {
  // Trakt.tv state
  const [traktClientId, setTraktClientId] = useState('');
  const [traktEnabled, setTraktEnabled] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // MDBList state
  const [mdbListApiKey, setMdbListApiKey] = useState('');
  const [mdbListEnabled, setMdbListEnabled] = useState(false);

  // Load Trakt config
  const { data: traktData } = trpc.traktConfig.get.useQuery();
  const traktConfig = traktData?.config;

  // Load MDBList config
  const { data: mdbListData } = trpc.mdblistConfig.get.useQuery();
  const mdbListConfig = mdbListData?.config;

  // Load existing configs on mount - syncing with external API data
  useEffect(() => {
    if (traktConfig?.clientId) {
      setTraktClientId(traktConfig.clientId);
      setTraktEnabled(true);
    } else {
      setTraktEnabled(false);
    }
  }, [traktConfig]);

  useEffect(() => {
    if (mdbListConfig?.apiKey) {
      setMdbListApiKey(mdbListConfig.apiKey);
      setMdbListEnabled(true);
    } else {
      setMdbListEnabled(false);
    }
  }, [mdbListConfig]);

  // Trakt mutations
  const saveTraktMutation = trpc.traktConfig.save.useMutation({
    ...createMutationCallbacks(toast, {
      onSuccessTitle: 'Success',
      onSuccessDescription: 'Trakt Client ID saved successfully',
      onErrorFallback: 'Failed to save Trakt Client ID',
      onSuccessCallback: () => void utils.traktConfig.get.invalidate(),
    }),
  });

  const deleteTraktMutation = trpc.traktConfig.delete.useMutation({
    ...createMutationCallbacks(toast, {
      onSuccessTitle: 'Success',
      onSuccessDescription: 'Trakt Client ID removed',
      onErrorFallback: 'Failed to remove Trakt Client ID',
      onSuccessCallback: () => {
        void utils.traktConfig.get.invalidate();
        setTraktClientId('');
      },
    }),
  });

  // MDBList mutations
  const saveMdbListMutation = trpc.mdblistConfig.save.useMutation({
    ...createMutationCallbacks(toast, {
      onSuccessTitle: 'Success',
      onSuccessDescription: 'MDBList API Key saved successfully',
      onErrorFallback: 'Failed to save MDBList API Key',
      onSuccessCallback: () => void utils.mdblistConfig.get.invalidate(),
    }),
  });

  const deleteMdbListMutation = trpc.mdblistConfig.delete.useMutation({
    ...createMutationCallbacks(toast, {
      onSuccessTitle: 'Success',
      onSuccessDescription: 'MDBList API Key removed',
      onErrorFallback: 'Failed to remove MDBList API Key',
      onSuccessCallback: () => {
        void utils.mdblistConfig.get.invalidate();
        setMdbListApiKey('');
      },
    }),
  });

  const isSavingTrakt = useMinLoading(saveTraktMutation.isPending || deleteTraktMutation.isPending);
  const isSavingMdbList = useMinLoading(
    saveMdbListMutation.isPending || deleteMdbListMutation.isPending
  );

  // Trakt handlers
  const handleTraktSave = () => {
    if (!traktEnabled) {
      if (traktConfig?.clientId) {
        deleteTraktMutation.mutate();
      }
      return;
    }

    const result = traktClientIdSchema.safeParse(traktClientId);
    if (!handleValidationResult(toast, result, 'Invalid Client ID')) return;
    saveTraktMutation.mutate({ clientId: result.data });
  };

  // MDBList handlers
  const handleMdbListSave = () => {
    if (!mdbListEnabled) {
      if (mdbListConfig?.apiKey) {
        deleteMdbListMutation.mutate();
      }
      return;
    }

    const result = mdblistApiKeySchema.safeParse(mdbListApiKey);
    if (!handleValidationResult(toast, result, 'Invalid API Key')) return;
    saveMdbListMutation.mutate({ apiKey: result.data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">API Keys</h3>
        <p className="mt-1 text-sm text-muted">Manage API keys for third-party services</p>
      </div>

      <Separator />

      <ProviderConfigCard
        name="Trakt"
        description="Fetch Trakt lists and charts. Get your Client ID from"
        helpUrl="https://trakt.tv/oauth/applications"
        helpLinkText="Trakt.tv API Applications"
        inputLabel="Client ID"
        inputPlaceholder="Your Trakt.tv Client ID"
        inputHelperText="Only the Client ID is required for reading public lists"
        value={traktClientId}
        onChange={setTraktClientId}
        enabled={traktEnabled}
        onToggle={setTraktEnabled}
        onSave={handleTraktSave}
        isConfigured={!!traktConfig?.clientId}
        isSaving={isSavingTrakt}
        isDisabled={saveTraktMutation.isPending || deleteTraktMutation.isPending}
        disabledWarning="Disabled — Trakt lists won't be processed."
      />

      <ProviderConfigCard
        name="MDBList"
        description="Fetch MDBList lists. Get your API key from"
        helpUrl="https://mdblist.com/preferences/"
        helpLinkText="MDBList Preferences"
        inputLabel="API Key"
        inputPlaceholder="Your MDBList API Key"
        value={mdbListApiKey}
        onChange={setMdbListApiKey}
        enabled={mdbListEnabled}
        onToggle={setMdbListEnabled}
        onSave={handleMdbListSave}
        isConfigured={!!mdbListConfig?.apiKey}
        isSaving={isSavingMdbList}
        isDisabled={saveMdbListMutation.isPending || deleteMdbListMutation.isPending}
        disabledWarning="Disabled — MDBList lists won't be processed."
      />

      {/* Future API Keys can be added here */}
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center text-muted">
            <Plus className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">More integrations coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
