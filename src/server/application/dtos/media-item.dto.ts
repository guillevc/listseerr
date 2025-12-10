/**
 * MediaItem Data Transfer Object
 *
 * Plain object representation of a media item for crossing boundaries.
 * Contains only primitives, no value objects or domain logic.
 */
export interface MediaItemDTO {
  title: string;
  year: number | null;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}
