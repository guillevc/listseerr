import { ProviderVO, type ProviderType } from 'shared/domain/value-objects/provider.vo';

interface ValidationResult {
  isValid: boolean;
  provider?: ProviderType;
  error?: string;
}

export function validateAndDetectProvider(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required',
    };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must start with http:// or https://',
    };
  }

  const detectedProvider = ProviderVO.detectFromUrl(trimmedUrl);
  if (detectedProvider) {
    return {
      isValid: true,
      provider: detectedProvider.getValue(),
    };
  }

  return {
    isValid: false,
    error: 'URL format not recognized',
  };
}

export function getProviderName(provider: ProviderType): string {
  return ProviderVO.create(provider).getDisplayName();
}
