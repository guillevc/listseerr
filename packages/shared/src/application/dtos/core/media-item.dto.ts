import type { MediaType } from '../../../domain/types/media.types';

/**
 * MediaItem Core DTO
 *
 * Plain object representation of a media item for crossing boundaries.
 * Contains only primitives - no Value Objects or Entities.
 *
 * Used by:
 * - MediaItemMapper for VO <-> DTO conversion
 * - Processing use cases
 * - tRPC router outputs
 */
export interface MediaItemDTO {
  title: string;
  year: number | null;
  tmdbId: number;
  mediaType: MediaType;
}
