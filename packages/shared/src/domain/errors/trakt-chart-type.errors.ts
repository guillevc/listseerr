import { DomainError } from './domain.error';

/**
 * Invalid Trakt Chart Type Error
 *
 * Thrown when an invalid Trakt chart type is provided.
 * Valid chart types: trending, popular, favorited, played, watched, collected, anticipated
 */
export class InvalidTraktChartTypeError extends DomainError {
  readonly code = 'INVALID_TRAKT_CHART_TYPE_ERROR' as const;

  constructor(chartType: string) {
    super(
      `Invalid Trakt chart type: ${chartType}. Must be one of: trending, popular, favorited, played, watched, collected, anticipated`
    );
  }
}
