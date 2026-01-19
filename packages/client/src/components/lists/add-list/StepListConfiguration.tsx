import type { ProviderType } from 'shared/domain/types';
import {
  TraktMediaTypeValues,
  type TraktChartType,
  type TraktMediaType,
} from 'shared/domain/types';
import {
  getProviderDisplayName,
  isTrakt,
  isTraktChart,
  isStevenLu,
  isAnilist,
  isMdbList,
} from 'shared/domain/logic';
import { TraktChartDisplayNames } from 'shared/domain/logic';
import { anilistStatusDisplayNames, type AnilistStatus } from 'shared/presentation/schemas';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { DialogFooter } from '../../ui/dialog';

interface StepListConfigurationProps {
  provider: ProviderType;
  name: string;
  onNameChange: (name: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  urlError: string | null;
  maxItems: string;
  onMaxItemsChange: (maxItems: string) => void;
  selectedMediaType: TraktMediaType;
  onMediaTypeChange: (mediaType: TraktMediaType) => void;
  selectedChartType: TraktChartType;
  onChartTypeChange: (chartType: TraktChartType) => void;
  // AniList-specific props
  anilistUsername: string;
  onAnilistUsernameChange: (username: string) => void;
  anilistUsernameError: string | null;
  anilistStatus: AnilistStatus;
  onAnilistStatusChange: (status: AnilistStatus) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function StepListConfiguration({
  provider,
  name,
  onNameChange,
  url,
  onUrlChange,
  urlError,
  maxItems,
  onMaxItemsChange,
  selectedMediaType,
  onMediaTypeChange,
  selectedChartType,
  onChartTypeChange,
  anilistUsername,
  onAnilistUsernameChange,
  anilistUsernameError,
  anilistStatus,
  onAnilistStatusChange,
  onBack,
  onSubmit,
  isLoading,
}: StepListConfigurationProps) {
  // Determine if URL field should be shown
  const showUrlField = isTrakt(provider) || isMdbList(provider);

  return (
    <>
      <div className="py-4">
        <div className="min-h-[350px] space-y-4">
          {/* List Name - ALWAYS FIRST */}
          <div className="grid gap-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              placeholder="My List"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isLoading}
            />
            {isTraktChart(provider) && (
              <p className="text-xs text-muted">Auto-generated - editable</p>
            )}
            {isStevenLu(provider) && <p className="text-xs text-muted">Default name - editable</p>}
            {isAnilist(provider) && <p className="text-xs text-muted">Auto-generated - editable</p>}
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
                      selectedMediaType === TraktMediaTypeValues.MOVIES ? 'default' : 'outline'
                    }
                    onClick={() => onMediaTypeChange(TraktMediaTypeValues.MOVIES)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Movies
                  </Button>
                  <Button
                    type="button"
                    variant={
                      selectedMediaType === TraktMediaTypeValues.SHOWS ? 'default' : 'outline'
                    }
                    onClick={() => onMediaTypeChange(TraktMediaTypeValues.SHOWS)}
                    className="flex-1"
                    disabled={isLoading}
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
                  onValueChange={(v) => onChartTypeChange(v as TraktChartType)}
                  disabled={isLoading}
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

          {/* AniList-specific fields */}
          {isAnilist(provider) && (
            <>
              {/* Username Input */}
              <div className="grid gap-2">
                <Label htmlFor="anilistUsername">AniList Username</Label>
                <Input
                  id="anilistUsername"
                  placeholder="Username"
                  value={anilistUsername}
                  onChange={(e) => onAnilistUsernameChange(e.target.value)}
                  variant={anilistUsernameError ? 'error' : anilistUsername ? 'success' : 'default'}
                  disabled={isLoading}
                />
                {anilistUsernameError && (
                  <p className="text-sm text-destructive">{anilistUsernameError}</p>
                )}
                {!anilistUsernameError && (
                  <p className="text-xs text-muted">
                    Your AniList username. Profile must be public.
                  </p>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="grid gap-2">
                <Label htmlFor="anilistStatus">List Status</Label>
                <Select
                  value={anilistStatus}
                  onValueChange={(v) => onAnilistStatusChange(v as AnilistStatus)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select list status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(anilistStatusDisplayNames).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* URL field for Trakt List and MDBList (not for Trakt Chart, StevenLu, or AniList) */}
          {showUrlField && (
            <div className="grid gap-2">
              <Label htmlFor="url">List URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                variant={urlError ? 'error' : url ? 'success' : 'default'}
                disabled={isLoading}
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
              onChange={(e) => onMaxItemsChange(e.target.value)}
              min="1"
              max="50"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted">Items to fetch (1-50). Default: 20</p>
          </div>

          {/* URL format info for Trakt List and MDBList */}
          {showUrlField && (
            <div className="space-y-2 rounded-md border bg-card/50 p-3">
              <p className="text-sm font-medium">URL format:</p>
              <div className="space-y-1.5 text-sm">
                {isTrakt(provider) ? (
                  <code className="block rounded bg-background px-1.5 py-0.5 text-xs">
                    https://trakt.tv/users/USERNAME/lists/LIST-SLUG?sort=rank
                  </code>
                ) : (
                  <code className="block rounded bg-background px-1.5 py-0.5 text-xs">
                    https://mdblist.com/lists/USERNAME/LIST-SLUG
                  </code>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={onSubmit} loading={isLoading}>
          Add List
        </Button>
      </DialogFooter>
    </>
  );
}
