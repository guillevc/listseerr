import { memo } from 'react';
import { AlertCircle } from 'lucide-react';
import type { ProviderType } from 'shared/domain/types';
import { getProviderDisplayName } from 'shared/domain/logic';
import { Badge } from '../../../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { getProviderName } from '../../../../lib/url-validator';

interface ProviderCellProps {
  provider: ProviderType;
  isProviderConfigured: boolean;
}

export const ProviderCell = memo(function ProviderCell({
  provider,
  isProviderConfigured,
}: ProviderCellProps) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <Badge variant={provider}>{getProviderName(provider)}</Badge>
      {!isProviderConfigured && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {getProviderDisplayName(provider)} provider is not configured. Configure API key in
                Settings → API Keys to enable processing.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
});
