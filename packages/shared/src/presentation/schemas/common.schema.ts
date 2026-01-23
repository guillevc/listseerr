/**
 * Common Schema Utilities
 *
 * Reusable schema builders for common validation patterns.
 * Eliminates duplication across feature-specific schemas.
 */

import { z } from 'zod';

/**
 * Creates a schema for HTTP/HTTPS URLs.
 * Validates protocol and format.
 *
 * @param options - Configuration options
 * @returns A Zod schema for URL validation
 *
 * @example
 * const urlSchema = createHttpUrlSchema();
 * const urlWithoutTrailing = createHttpUrlSchema({ stripTrailingSlash: true });
 */
export function createHttpUrlSchema(
  options: {
    /** Error message for invalid URL */
    urlMessage?: string;
    /** Error message for invalid protocol */
    protocolMessage?: string;
    /** Strip trailing slash from URL */
    stripTrailingSlash?: boolean;
    /** Strip query parameters from URL */
    stripQueryParams?: boolean;
  } = {}
) {
  const {
    urlMessage = 'Must be a valid URL',
    protocolMessage = 'Must be a valid HTTP/HTTPS URL',
    stripTrailingSlash = false,
    stripQueryParams = false,
  } = options;

  const schema = z.url({ message: urlMessage }).refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: protocolMessage }
  );

  if (stripTrailingSlash && stripQueryParams) {
    return schema.transform((url) => (url.split('?')[0] ?? url).replace(/\/$/, ''));
  } else if (stripTrailingSlash) {
    return schema.transform((url) => url.replace(/\/$/, ''));
  } else if (stripQueryParams) {
    return schema.transform((url) => url.split('?')[0] ?? url);
  }

  return schema;
}

/**
 * Creates a non-empty trimmed string schema.
 *
 * @param fieldName - Field name for error messages
 * @returns A Zod schema for non-empty strings
 *
 * @example
 * const nameSchema = createNonEmptyStringSchema('Name');
 */
export function createNonEmptyStringSchema(fieldName: string) {
  return z
    .string()
    .min(1, `${fieldName} is required`)
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { message: `${fieldName} cannot be empty` });
}

/**
 * Creates a bounded integer schema.
 *
 * @param options - Configuration options
 * @returns A Zod schema for integers within bounds
 *
 * @example
 * const maxItemsSchema = createBoundedIntSchema({ min: 1, max: 50, default: 20 });
 */
export function createBoundedIntSchema(options: {
  min?: number;
  max?: number;
  default?: number;
  minMessage?: string;
  maxMessage?: string;
  intMessage?: string;
}) {
  const {
    min,
    max,
    default: defaultValue,
    minMessage,
    maxMessage,
    intMessage = 'Must be a whole number',
  } = options;

  let schema = z.number().int({ message: intMessage });

  if (min !== undefined) {
    schema = schema.min(min, { message: minMessage ?? `Must be at least ${min}` });
  }

  if (max !== undefined) {
    schema = schema.max(max, { message: maxMessage ?? `Must be at most ${max}` });
  }

  if (defaultValue !== undefined) {
    return schema.default(defaultValue);
  }

  return schema;
}

/**
 * Creates a positive integer schema.
 *
 * @param fieldName - Field name for error messages
 * @returns A Zod schema for positive integers
 */
export function createPositiveIntSchema(fieldName: string) {
  return z
    .number()
    .int(`${fieldName} must be an integer`)
    .positive(`${fieldName} must be positive`);
}

/**
 * Creates an API key/secret schema.
 * Validates non-empty, trimmed string.
 *
 * @param fieldName - Field name for error messages
 * @returns A Zod schema for API keys
 */
export function createApiKeySchema(fieldName = 'API key') {
  return z
    .string()
    .min(1, `${fieldName} is required`)
    .transform((key) => key.trim());
}
