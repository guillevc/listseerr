import type { ProviderType } from 'shared/domain/types';
import { Label } from '../../ui/label';
import { RadioGroup } from '../../ui/radio-group';
import { Button } from '../../ui/button';
import { DialogFooter } from '../../ui/dialog';
import { ProviderOptionCard } from './ProviderOptionCard';

const PROVIDER_OPTIONS = [
  { value: 'trakt' as const, description: 'Public lists', requiresConfig: true },
  {
    value: 'traktChart' as const,
    description: 'Trending, Popular, and more',
    requiresConfig: true,
  },
  {
    value: 'mdblist' as const,
    description: 'Public and custom lists',
    requiresConfig: true,
  },
  {
    value: 'stevenlu' as const,
    description: 'Popular movies, updated daily',
    requiresConfig: false,
  },
  {
    value: 'anilist' as const,
    description: 'Anime watchlists',
    requiresConfig: false,
  },
];

interface StepProviderSelectionProps {
  provider: ProviderType;
  onProviderChange: (provider: ProviderType) => void;
  isProviderConfigured: (provider: ProviderType) => boolean;
  onContinue: () => void;
}

export function StepProviderSelection({
  provider,
  onProviderChange,
  isProviderConfigured,
  onContinue,
}: StepProviderSelectionProps) {
  return (
    <>
      <div className="space-y-3 py-4">
        <div className="grid gap-2">
          <Label>Provider</Label>
          <RadioGroup
            value={provider}
            onValueChange={(value) => onProviderChange(value as ProviderType)}
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
        <Button onClick={onContinue}>Continue</Button>
      </DialogFooter>
    </>
  );
}
