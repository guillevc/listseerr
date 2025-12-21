import type { ProviderType } from 'shared/domain/types';
import { detectProviderFromUrl, getProviderDisplayName } from 'shared/domain/logic';
import { listUrlSchema } from 'shared/presentation/schemas';

interface ValidationResult {
  isValid: boolean;
  provider?: ProviderType;
  error?: string;
}

export function validateAndDetectProvider(url: string): ValidationResult {
  // Use shared schema for URL validation
  const parseResult = listUrlSchema.safeParse(url);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    return {
      isValid: false,
      error: firstIssue?.message ?? 'Invalid URL',
    };
  }

  // Detect provider from validated URL
  const detectedProvider = detectProviderFromUrl(parseResult.data);
  if (detectedProvider) {
    return {
      isValid: true,
      provider: detectedProvider,
    };
  }

  return {
    isValid: false,
    error: 'URL format not recognized',
  };
}

export function getProviderName(provider: ProviderType): string {
  return getProviderDisplayName(provider);
}
