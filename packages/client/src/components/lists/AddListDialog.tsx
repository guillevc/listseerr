import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import type { ProviderType } from 'shared/domain/types/provider.types';
import {
  TraktChartTypeValues,
  TraktMediaTypeValues,
  type TraktChartType,
  type TraktMediaType,
} from 'shared/domain/types/trakt.types';
import {
  getProviderDisplayName,
  isTrakt,
  isTraktChart,
  isMdbList,
  isStevenLu,
} from 'shared/domain/logic/provider.logic';
import {
  TraktChartDisplayNames,
  getTraktChartDisplayName,
} from 'shared/domain/logic/trakt-chart-type.logic';
import { listNameSchema, maxItemsSchema } from 'shared/presentation/schemas/list.schema';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { validateAndDetectProvider, getProviderName } from '../../lib/url-validator';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { trpc } from '../../lib/trpc';

const PROVIDER_OPTIONS = [
  { value: 'trakt' as const, description: 'Public lists', requiresConfig: true },
  {
    value: 'traktChart' as const,
    description: 'Curated charts like Trending, Popular, etc.',
    requiresConfig: true,
  },
  {
    value: 'mdblist' as const,
    description: 'Public and custom lists',
    requiresConfig: true,
  },
  {
    value: 'stevenlu' as const,
    description: 'Popular movies list (updated daily)',
    requiresConfig: false,
  },
];

interface ProviderOptionCardProps {
  value: ProviderType;
  description: string;
  isConfigured?: boolean;
  showConfigBadge?: boolean;
}

function ProviderOptionCard({
  value,
  description,
  isConfigured,
  showConfigBadge,
}: ProviderOptionCardProps) {
  const label = getProviderDisplayName(value);

  return (
    <label className="block cursor-pointer">
      <RadioGroupItem value={value} className="peer sr-only" />
      <div className="flex min-h-[80px] items-center gap-4 rounded-lg border-2 border-input p-5 transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/20 hover:border-primary-hover/50 peer-data-[state=checked]:hover:border-primary">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted">{description}</p>
            </div>
            {showConfigBadge && !isConfigured && (
              <Badge variant="warning" className="whitespace-nowrap">
                <AlertCircle className="mr-1 h-3 w-3" />
                Configuration missing
              </Badge>
            )}
          </div>
        </div>
      </div>
    </label>
  );
}

export function AddListDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [maxItems, setMaxItems] = useState('20');
  const [provider, setProvider] = useState<ProviderType>('trakt');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<TraktMediaType>(
    TraktMediaTypeValues.MOVIES
  );
  const [selectedChartType, setSelectedChartType] = useState<TraktChartType>(
    TraktChartTypeValues.TRENDING
  );
  const [userEditedName, setUserEditedName] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [progressAnimated, setProgressAnimated] = useState(false);
  const { toast } = useToast();

  const utils = trpc.useUtils();

  // Query provider configs for status indicators
  const { data: traktData } = trpc.traktConfig.get.useQuery();
  const traktConfig = traktData?.config;
  const { data: mdbListData } = trpc.mdblistConfig.get.useQuery();
  const mdbListConfig = mdbListData?.config;

  const isProviderConfigured = (providerValue: ProviderType): boolean => {
    if (isStevenLu(providerValue)) return true;
    if (isTrakt(providerValue) || isTraktChart(providerValue)) return !!traktConfig?.clientId;
    if (isMdbList(providerValue)) return !!mdbListConfig?.apiKey;
    return false;
  };

  const createMutation = trpc.lists.create.useMutation({
    onSuccess: (result) => {
      const newList = result.list;

      // Invalidate all related queries
      void utils.lists.getAll.invalidate();
      void utils.dashboard.getStats.invalidate();

      // Only show success toast if the list is enabled
      // If disabled, the manual toast below will handle it
      if (newList.enabled) {
        toast({
          title: 'List Added',
          description: `${newList.name} has been added successfully`,
        });
      }

      setName('');
      setUrl('');
      setMaxItems('20');
      setUrlError(null);
      setUserEditedName(false);
      setCurrentStep(1);
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
  const isCreating = useMinLoading(createMutation.isPending);

  // Auto-generate name for traktChart and stevenlu
  // For traktChart, always regenerate when media/chart type changes
  // For stevenlu, only regenerate if user hasn't manually edited
  const autoGeneratedName = (() => {
    if (isTraktChart(provider)) {
      const chartLabel = getTraktChartDisplayName(selectedChartType);
      const mediaLabel = selectedMediaType === TraktMediaTypeValues.MOVIES ? 'Movies' : 'Shows';
      return `${chartLabel} ${mediaLabel} ${getProviderDisplayName(provider)}`;
    } else if (isStevenLu(provider)) {
      return `${getProviderDisplayName(provider)} Popular Movies`;
    }
    return '';
  })();

  // Use auto-generated name unless user has manually edited
  const effectiveName = userEditedName ? name : autoGeneratedName || name;

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      const result = validateAndDetectProvider(value);
      if (!result.isValid || result.provider !== provider) {
        setUrlError(`Please enter a valid ${getProviderDisplayName(provider)} URL`);
      } else {
        setUrlError(null);
      }
    } else {
      setUrlError(null);
    }
  };

  const handleProviderChange = (newProvider: ProviderType) => {
    setProvider(newProvider);
    setUserEditedName(false); // Reset edit flag when provider changes
    // Re-validate URL if one exists (only for trakt and mdblist)
    if (!isTraktChart(newProvider) && !isStevenLu(newProvider) && url) {
      const result = validateAndDetectProvider(url);
      if (!result.isValid || result.provider !== newProvider) {
        setUrlError(`Please enter a valid ${getProviderDisplayName(newProvider)} URL`);
      } else {
        setUrlError(null);
      }
    } else {
      setUrlError(null);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset to step 1 when opening dialog
      setCurrentStep(1);
      setName('');
      setUrl('');
      setMaxItems('20');
      setUrlError(null);
      setUserEditedName(false);
      setSelectedMediaType(TraktMediaTypeValues.MOVIES);
      setSelectedChartType(TraktChartTypeValues.TRENDING);
      setProgressAnimated(false);

      // Trigger progress bar animation from 0% to 50%
      setTimeout(() => {
        setProgressAnimated(true);
      }, 50);
    }
  };

  const goToStep2 = () => {
    setCurrentStep(2);
    // Trigger auto-name generation when entering step 2
    // For traktChart, always generate name
    // For stevenlu, only generate if user hasn't edited
    // For trakt and mdblist, clear name if user hasn't edited
    if (isTraktChart(provider)) {
      const chartLabel = getTraktChartDisplayName(selectedChartType);
      const mediaLabel = selectedMediaType === TraktMediaTypeValues.MOVIES ? 'Movies' : 'Shows';
      setName(`${chartLabel} ${mediaLabel} ${getProviderDisplayName(provider)}`);
    } else if (isStevenLu(provider) && !userEditedName) {
      setName(`${getProviderDisplayName(provider)} Popular Movies`);
    } else if ((isTrakt(provider) || isMdbList(provider)) && !userEditedName) {
      setName('');
    }
  };

  const goToStep1 = () => {
    setCurrentStep(1);
    // Clear form data when going back to provider selection
    setName('');
    setUrl('');
    setMaxItems('20');
    setUrlError(null);
    setUserEditedName(false);
    setSelectedMediaType(TraktMediaTypeValues.MOVIES);
    setSelectedChartType(TraktChartTypeValues.TRENDING);
  };

  const handleAdd = () => {
    // Validate name using shared schema
    const nameResult = listNameSchema.safeParse(effectiveName);
    if (!nameResult.success) {
      const firstIssue = nameResult.error.issues[0];
      toast({
        title: 'Error',
        description: firstIssue?.message ?? 'Invalid name',
        variant: 'destructive',
      });
      return;
    }

    let finalUrl = url;
    let displayUrl: string | null = null;

    // For traktChart, construct the URL from selections
    if (isTraktChart(provider)) {
      finalUrl = `https://trakt.tv/${selectedMediaType}/${selectedChartType}`;
    } else if (isStevenLu(provider)) {
      // For StevenLu, use the API URL internally but display the user-facing URL
      finalUrl = 'https://s3.amazonaws.com/popular-movies/movies.json';
      displayUrl = 'https://movies.stevenlu.com';
    } else {
      // Validate URL for trakt and mdblist
      const result = validateAndDetectProvider(url);
      if (!result.isValid || result.provider !== provider) {
        toast({
          title: 'Error',
          description: `Please enter a valid ${getProviderDisplayName(provider)} URL`,
          variant: 'destructive',
        });
        return;
      }
    }

    // Check if provider is configured
    const isConfigured = isProviderConfigured(provider);

    // Validate maxItems using shared schema
    const maxItemsNum = parseInt(maxItems);
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

    createMutation.mutate({
      name: nameResult.data, // Use validated & trimmed name
      url: finalUrl,
      ...(displayUrl ? { displayUrl } : {}),
      provider: provider,
      enabled: isConfigured,
      maxItems: maxItemsResult.data, // Use validated maxItems
    });

    // Show info message if provider not configured
    if (!isConfigured) {
      setTimeout(() => {
        toast({
          title: 'List Added as Disabled',
          description: `The list was added but is disabled because ${getProviderDisplayName(provider)} is not configured. Configure the provider in Settings → API Keys to enable processing.`,
        });
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {/* Dialog Header - Always Visible */}
        <DialogHeader>
          <DialogTitle>Add New List</DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? 'Choose a provider to continue'
              : `Configure your ${getProviderName(provider)} list`}
          </DialogDescription>
        </DialogHeader>

        {/* Animated Progress Bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-card">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: currentStep === 1 ? (progressAnimated ? '50%' : '0%') : '100%',
            }}
          ></div>
        </div>

        {/* STEP 1: Provider Selection */}
        {currentStep === 1 && (
          <>
            <div className="space-y-3 py-4">
              <div className="grid gap-2">
                <Label>Provider</Label>
                <RadioGroup
                  value={provider}
                  onValueChange={(value) => handleProviderChange(value as ProviderType)}
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <ProviderOptionCard
                      key={option.value}
                      value={option.value}
                      description={option.description}
                      isConfigured={isProviderConfigured(option.value)}
                      showConfigBadge={option.requiresConfig}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={goToStep2}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {/* STEP 2: Configure Details */}
        {currentStep === 2 && (
          <>
            <div className="py-4">
              <div className="min-h-[350px] space-y-4">
                {/* List Name - ALWAYS FIRST */}
                <div className="grid gap-2">
                  <Label htmlFor="name">List Name</Label>
                  <Input
                    id="name"
                    placeholder="My List"
                    value={effectiveName}
                    onChange={(e) => {
                      setName(e.target.value);
                      setUserEditedName(true);
                    }}
                  />
                  {isTraktChart(provider) && (
                    <p className="text-xs text-muted">
                      Name is auto-generated based on your chart selection (you can edit it)
                    </p>
                  )}
                  {isStevenLu(provider) && (
                    <p className="text-xs text-muted">Default name provided (you can edit it)</p>
                  )}
                </div>

                {/* Media Type and Chart Type fields for Trakt Chart */}
                {isTraktChart(provider) && (
                  <>
                    {/* Media Type Selection */}
                    <div className="grid gap-2">
                      <Label>Media Type</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            selectedMediaType === TraktMediaTypeValues.MOVIES
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => setSelectedMediaType(TraktMediaTypeValues.MOVIES)}
                          className="flex-1"
                        >
                          Movies
                        </Button>
                        <Button
                          type="button"
                          variant={
                            selectedMediaType === TraktMediaTypeValues.SHOWS ? 'default' : 'outline'
                          }
                          onClick={() => setSelectedMediaType(TraktMediaTypeValues.SHOWS)}
                          className="flex-1"
                        >
                          Shows
                        </Button>
                      </div>
                    </div>

                    {/* Chart Type Dropdown */}
                    <div className="grid gap-2">
                      <Label htmlFor="chartType">Chart Type</Label>
                      <Select
                        value={selectedChartType}
                        onValueChange={(v) => setSelectedChartType(v as TraktChartType)}
                      >
                        <SelectTrigger>
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
                    </div>
                  </>
                )}

                {/* URL field for Trakt List and MDBList (not for Trakt Chart or StevenLu) */}
                {!isTraktChart(provider) && !isStevenLu(provider) && (
                  <div className="grid gap-2">
                    <Label htmlFor="url">List URL</Label>
                    <Input
                      id="url"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      variant={urlError ? 'error' : url ? 'success' : 'default'}
                    />
                    {urlError && <p className="text-sm text-destructive">{urlError}</p>}
                    {!urlError && url && (
                      <p className="text-sm text-success">
                        Valid {getProviderDisplayName(provider)} URL detected
                      </p>
                    )}
                  </div>
                )}

                {/* Max Items */}
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
                  <p className="text-xs text-muted">
                    Maximum number of items to fetch from the list (1-50). Default: 20
                  </p>
                </div>

                {/* URL format info for Trakt List and MDBList */}
                {!isTraktChart(provider) && !isStevenLu(provider) && (
                  <div className="space-y-2 rounded-md border bg-card/50 p-3">
                    <p className="text-sm font-medium">
                      {getProviderDisplayName(provider)} URL format:
                    </p>
                    <div className="space-y-1.5 text-sm">
                      {isTrakt(provider) ? (
                        <>
                          <code className="block rounded bg-background px-1.5 py-0.5 text-xs">
                            https://trakt.tv/users/USERNAME/lists/LIST-SLUG?sort=rank
                          </code>
                        </>
                      ) : (
                        <>
                          <code className="block rounded bg-background px-1.5 py-0.5 text-xs">
                            https://mdblist.com/lists/USERNAME/LIST-SLUG
                          </code>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={goToStep1}>
                Back
              </Button>
              <Button onClick={handleAdd} loading={isCreating}>
                Add List
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
