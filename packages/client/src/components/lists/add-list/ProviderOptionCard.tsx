import { AlertCircle } from 'lucide-react';
import type { ProviderType } from 'shared/domain/types/provider.types';
import { getProviderDisplayName } from 'shared/domain/logic/provider.logic';
import { RadioGroupItem } from '../../ui/radio-group';
import { Badge } from '../../ui/badge';

interface ProviderOptionCardProps {
  value: ProviderType;
  description: string;
  isConfigured?: boolean;
  showConfigBadge?: boolean;
}

export function ProviderOptionCard({
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
              <Badge variant="warning">
                <AlertCircle className="mr-1 h-4 w-4" />
                Setup required
              </Badge>
            )}
          </div>
        </div>
      </div>
    </label>
  );
}
