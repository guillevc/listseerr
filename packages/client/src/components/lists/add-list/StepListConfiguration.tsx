import type { ProviderType } from 'shared/domain/types/provider.types';
import {
  TraktMediaTypeValues,
  type TraktChartType,
  type TraktMediaType,
} from 'shared/domain/types/trakt.types';
import {
  getProviderDisplayName,
  isTrakt,
  isTraktChart,
  isStevenLu,
} from 'shared/domain/logic/provider.logic';
import { TraktChartDisplayNames } from 'shared/domain/logic/trakt-chart-type.logic';
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
  onBack,
  onSubmit,
  isLoading,
}: StepListConfigurationProps) {
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
            />
            {isTraktChart(provider) && (
              <p className="text-xs text-muted">Auto-generated — editable</p>
            )}
            {isStevenLu(provider) && <p className="text-xs text-muted">Default name — editable</p>}
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
                onChange={(e) => onUrlChange(e.target.value)}
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
              onChange={(e) => onMaxItemsChange(e.target.value)}
              min="1"
              max="50"
              required
            />
            <p className="text-xs text-muted">Items to fetch (1-50). Default: 20</p>
          </div>

          {/* URL format info for Trakt List and MDBList */}
          {!isTraktChart(provider) && !isStevenLu(provider) && (
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
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit} loading={isLoading}>
          Add List
        </Button>
      </DialogFooter>
    </>
  );
}
