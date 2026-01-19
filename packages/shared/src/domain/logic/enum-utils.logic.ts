/**
 * Generic Enum Utility Factories
 *
 * Provides factory functions to create validators, normalizers, and type guards
 * for const enum-like objects. Eliminates code duplication across logic files.
 */

/**
 * Creates a validator function for enum-like const objects.
 * Returns a type guard that checks if a value is a valid enum member.
 *
 * @param values - The const object defining valid values (e.g., MediaTypeValues)
 * @param options - Optional configuration
 * @returns A type guard function
 *
 * @example
 * const isValidMediaType = createEnumValidator(MediaTypeValues);
 * if (isValidMediaType(input)) {
 *   // input is narrowed to MediaType
 * }
 */
export function createEnumValidator<T extends string>(
  values: Record<string, T>,
  options: { caseSensitive?: boolean } = {}
): (value: string) => value is T {
  const { caseSensitive = true } = options;
  const validValues = Object.values(values);

  return (value: string): value is T => {
    if (caseSensitive) {
      return validValues.includes(value as T);
    }
    // For case-insensitive comparison, normalize both sides
    const lowerValue = value.toLowerCase();
    return validValues.some((v) => v.toLowerCase() === lowerValue);
  };
}

/**
 * Creates a case-insensitive validator that normalizes to lowercase.
 * Commonly used for URL-based or user-input enums.
 *
 * @param values - The const object defining valid values
 * @returns A type guard function that normalizes input to lowercase
 */
export function createCaseInsensitiveEnumValidator<T extends string>(
  values: Record<string, T>
): (value: string) => value is T {
  return createEnumValidator(values, { caseSensitive: false });
}

/**
 * Creates a normalizer function that converts a string to its canonical enum value.
 * Throws an error if the value is invalid.
 *
 * @param values - The const object defining valid values
 * @param typeName - Human-readable name for error messages
 * @param options - Optional configuration
 * @returns A normalizer function
 *
 * @example
 * const normalizeMediaType = createEnumNormalizer(MediaTypeValues, 'media type');
 * const normalized = normalizeMediaType('MOVIE'); // Returns 'movie'
 */
export function createEnumNormalizer<T extends string>(
  values: Record<string, T>,
  typeName: string,
  options: { caseSensitive?: boolean } = {}
): (value: string) => T {
  const { caseSensitive = false } = options;
  const validValues = Object.values(values);

  return (value: string): T => {
    if (caseSensitive) {
      if (!validValues.includes(value as T)) {
        throw new Error(`Invalid ${typeName}: ${value}`);
      }
      return value as T;
    }
    // For case-insensitive, find the matching canonical value
    const lowerValue = value.toLowerCase();
    const match = validValues.find((v) => v.toLowerCase() === lowerValue);
    if (!match) {
      throw new Error(`Invalid ${typeName}: ${value}`);
    }
    return match;
  };
}

/**
 * Creates a type guard function that checks if a value equals a specific enum member.
 *
 * @param targetValue - The specific enum value to check against
 * @returns A type guard function
 *
 * @example
 * const isMovie = createEnumGuard(MediaTypeValues.MOVIE);
 * if (isMovie(mediaType)) {
 *   // mediaType is confirmed to be 'movie'
 * }
 */
export function createEnumGuard<T extends string>(targetValue: T): (value: string) => boolean {
  return (value: string): boolean => value === targetValue;
}

/**
 * Creates a display name getter function for an enum.
 *
 * @param displayNames - Record mapping enum values to display names
 * @returns A function that returns the display name for a value
 *
 * @example
 * const getProviderDisplayName = createDisplayNameGetter(ProviderDisplayNames);
 * getProviderDisplayName('trakt'); // 'Trakt List'
 */
export function createDisplayNameGetter<T extends string>(
  displayNames: Record<T, string>
): (value: T) => string {
  return (value: T): string => displayNames[value];
}
