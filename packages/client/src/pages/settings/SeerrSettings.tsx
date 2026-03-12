import { useReducer, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { trpc } from '../../lib/trpc';
import {
  handleValidationResult,
  createMutationCallbacks,
  showErrorToast,
  showSuccessToast,
} from '../../lib/toast-helpers';
import { seerrConfigSchema, seerrTestConnectionSchema } from 'shared/presentation/schemas';
import type { TvSeasonsPrimitive } from 'shared/domain/types';

interface SeerrFormState {
  url: string;
  externalUrl: string;
  apiKey: string;
  userId: string;
  tvSeasons: TvSeasonsPrimitive;
}

type SeerrFormAction =
  | {
      type: 'LOAD';
      config: {
        url?: string;
        externalUrl?: string;
        apiKey?: string;
        userIdSeerr: number;
        tvSeasons?: TvSeasonsPrimitive;
      };
    }
  | { type: 'SET_FIELD'; field: keyof SeerrFormState; value: string };

const initialState: SeerrFormState = {
  url: '',
  externalUrl: '',
  apiKey: '',
  userId: '',
  tvSeasons: 'first',
};

function seerrFormReducer(state: SeerrFormState, action: SeerrFormAction): SeerrFormState {
  switch (action.type) {
    case 'LOAD':
      return {
        url: action.config.url || '',
        externalUrl: action.config.externalUrl || '',
        apiKey: action.config.apiKey || '',
        userId: action.config.userIdSeerr.toString() || '',
        tvSeasons: action.config.tvSeasons || 'first',
      };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
  }
}

export function SeerrSettings() {
  const [state, dispatch] = useReducer(seerrFormReducer, initialState);
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const { data: configData } = trpc.config.get.useQuery();
  const config = configData?.config;

  const testMutation = trpc.config.test.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        showSuccessToast(toast, 'Success', result.message);
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      showErrorToast(toast, error);
    },
  });

  const saveMutation = trpc.config.set.useMutation({
    ...createMutationCallbacks(toast, {
      onSuccessTitle: 'Saved',
      onSuccessDescription: 'Seerr configuration saved successfully',
      onSuccessCallback: () => {
        void utils.config.get.invalidate();
        void utils.dashboard.getPendingRequests.invalidate();
      },
    }),
  });
  const isSaving = useMinLoading(saveMutation.isPending);

  // Load config when it changes - syncing with external API data
  useEffect(() => {
    if (config) {
      dispatch({ type: 'LOAD', config });
    }
  }, [config]);

  const handleTest = () => {
    const result = seerrTestConnectionSchema.safeParse({ url: state.url, apiKey: state.apiKey });
    if (!handleValidationResult(toast, result, 'Invalid configuration')) return;

    testMutation.mutate({
      url: result.data.url,
      apiKey: result.data.apiKey,
    });
  };

  const handleSave = () => {
    const result = seerrConfigSchema.safeParse({
      url: state.url,
      externalUrl: state.externalUrl || undefined,
      apiKey: state.apiKey,
      userIdSeerr: parseInt(state.userId) || 0,
      tvSeasons: state.tvSeasons,
    });
    if (!handleValidationResult(toast, result, 'Invalid configuration')) return;

    saveMutation.mutate({
      url: result.data.url,
      externalUrl: result.data.externalUrl,
      apiKey: result.data.apiKey,
      userIdSeerr: result.data.userIdSeerr,
      tvSeasons: result.data.tvSeasons,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Seerr</h3>
        <p className="mt-1 text-sm text-muted">Connect your Seerr instance.</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="url">
            Internal URL <span className="text-re">*</span>
          </Label>
          <Input
            id="url"
            placeholder="https://seerr.example.com"
            value={state.url}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'url', value: e.target.value })}
          />
          <p className="text-xs text-muted">Must be reachable from Listseerr.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="externalUrl">External URL (Optional)</Label>
          <Input
            id="externalUrl"
            placeholder="https://seerr.example.com"
            value={state.externalUrl}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'externalUrl', value: e.target.value })
            }
          />
          <p className="text-xs text-muted">
            Use when internal URL differs from public, e.g. Docker network URLs.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="apiKey">
            API Key <span className="text-re">*</span>
          </Label>
          <PasswordInput
            id="apiKey"
            placeholder="Your API key"
            autoComplete="off"
            value={state.apiKey}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'apiKey', value: e.target.value })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="userId">
            Default User ID <span className="text-re">*</span>
          </Label>
          <Input
            id="userId"
            type="number"
            placeholder="1"
            value={state.userId}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'userId', value: e.target.value })
            }
          />
          <p className="text-xs text-muted">
            Seerr user ID used for all requests. Tip: use a user without auto-approve to review
            requests first. Can be overridden per list in list settings.
          </p>
        </div>

        <div className="grid gap-2">
          <Label>TV show seasons</Label>
          <p className="text-xs text-muted">
            Choose whether to request only the first season or all available seasons for TV shows.
          </p>
          <RadioGroup
            value={state.tvSeasons}
            onValueChange={(value) => dispatch({ type: 'SET_FIELD', field: 'tvSeasons', value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="first" id="tvSeasons-first" />
              <Label htmlFor="tvSeasons-first" className="font-normal">
                First season only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="tvSeasons-all" />
              <Label htmlFor="tvSeasons-all" className="font-normal">
                All seasons
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleTest} loading={testMutation.isPending}>
            Test Connection
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
