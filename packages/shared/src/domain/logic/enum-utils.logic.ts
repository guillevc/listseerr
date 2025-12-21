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
    const checkValue = caseSensitive ? value : value.toLowerCase();
    return validValues.includes(checkValue as T);
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
    const normalized = caseSensitive ? value : value.toLowerCase();
    if (!validValues.includes(normalized as T)) {
      throw new Error(`Invalid ${typeName}: ${value}`);
    }
    return normalized as T;
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
 * Creates multiple type guard functions for all values in an enum.
 * Returns an object with `is{Key}` functions for each enum key.
 *
 * @param values - The const object defining valid values
 * @returns An object with type guard functions
 *
 * @example
 * const guards = createEnumGuards(MediaTypeValues);
 * guards.isMovie('movie'); // true
 * guards.isTv('movie'); // false
 */
export function createEnumGuards<T extends string>(
  values: Record<string, T>
): Record<string, (value: T) => boolean> {
  const guards: Record<string, (value: T) => boolean> = {};

  for (const [key, value] of Object.entries(values)) {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    const guardName = `is${capitalizedKey}`;
    guards[guardName] = createEnumGuard(value);
  }

  return guards;
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
