import { useCallback } from 'react';
import type { ProviderType } from 'shared/domain/types';
import { isTrakt, isTraktChart, isMdbList, isStevenLu } from 'shared/domain/logic';
import { trpc } from '../lib/trpc';

interface ProviderConfigData {
  traktClientId: string | undefined;
  mdbListApiKey: string | undefined;
}

interface UseProviderConfigReturn {
  /** Check if a provider is configured */
  isProviderConfigured: (provider: ProviderType) => boolean;
  /** Raw config data for both providers */
  configData: ProviderConfigData;
  /** Whether config data is still loading */
  isLoading: boolean;
}

/**
 * Hook to check provider configuration status.
 * Centralizes provider config checks used across ListsTable, AddListDialog, and DashboardStats.
 */
export function useProviderConfig(): UseProviderConfigReturn {
  const { data: traktData, isLoading: isTraktLoading } = trpc.traktConfig.get.useQuery();
  const traktConfig = traktData?.config;

  const { data: mdbListData, isLoading: isMdbListLoading } = trpc.mdblistConfig.get.useQuery();
  const mdbListConfig = mdbListData?.config;

  const isProviderConfigured = useCallback(
    (provider: ProviderType): boolean => {
      if (isStevenLu(provider)) return true;
      if (isTrakt(provider) || isTraktChart(provider)) return !!traktConfig?.clientId;
      if (isMdbList(provider)) return !!mdbListConfig?.apiKey;
      return false;
    },
    [traktConfig?.clientId, mdbListConfig?.apiKey]
  );

  return {
    isProviderConfigured,
    configData: {
      traktClientId: traktConfig?.clientId,
      mdbListApiKey: mdbListConfig?.apiKey,
    },
    isLoading: isTraktLoading || isMdbListLoading,
  };
}
