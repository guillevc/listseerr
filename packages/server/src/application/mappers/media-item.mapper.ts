import { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type { MediaItemDTO } from 'shared/application/dtos/core/media-item.dto';
import { MediaTypeVO } from '@/server/domain/value-objects/media-type.vo';

export class MediaItemMapper {
  static toDTO(vo: MediaItemVO): MediaItemDTO {
    return {
      title: vo.title,
      year: vo.year,
      tmdbId: vo.tmdbId,
      mediaType: vo.mediaType.getValue(),
    };
  }

  static toVO(dto: MediaItemDTO): MediaItemVO {
    return MediaItemVO.create({
      title: dto.title,
      year: dto.year,
      tmdbId: dto.tmdbId,
      mediaType: MediaTypeVO.create(dto.mediaType),
    });
  }
}
