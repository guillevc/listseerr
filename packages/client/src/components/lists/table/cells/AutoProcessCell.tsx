import type { ProviderType } from 'shared/domain/types';
import { getProviderDisplayName } from 'shared/domain/logic';
import { Switch } from '../../../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';

interface AutoProcessCellProps {
  listId: number;
  provider: ProviderType;
  enabled: boolean;
  isProviderConfigured: boolean;
  isAutomaticProcessingEnabled: boolean;
  isMutating: boolean;
  onToggle: (id: number) => void;
}

export function AutoProcessCell({
  listId,
  provider,
  enabled,
  isProviderConfigured,
  isAutomaticProcessingEnabled,
  isMutating,
  onToggle,
}: AutoProcessCellProps) {
  const isDisabled = !isAutomaticProcessingEnabled || isMutating || !isProviderConfigured;
  // Show as OFF when automatic processing is disabled or provider not configured
  const checkedState = isAutomaticProcessingEnabled && isProviderConfigured ? enabled : false;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Switch
              checked={checkedState}
              onCheckedChange={() => onToggle(listId)}
              disabled={isDisabled}
              className="transition-all duration-200"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {!isProviderConfigured ? (
            <p>
              {getProviderDisplayName(provider)} provider is not configured. Configure API key in{' '}
              <span className="font-medium">Settings → API Keys</span> to enable processing.
            </p>
          ) : !isAutomaticProcessingEnabled ? (
            <p>
              Automatic processing is disabled. Enable it in{' '}
              <span className="font-medium">Settings → Automatic Processing</span> to enable
              scheduled processing.
            </p>
          ) : (
            <p>Toggle scheduled automatic processing for this list</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
