import type { User } from '@/server/domain/entities/user.entity';
import type { UserDTO } from 'shared/application/dtos';

/**
 * User Mapper
 *
 * Converts User entities to DTOs for the presentation layer.
 * Note: Excludes sensitive data like passwordHash.
 */
export class UserMapper {
  static toDTO(entity: User): UserDTO {
    return {
      id: entity.id,
      username: entity.username.getValue(),
      createdAt: entity.createdAt,
    };
  }
}
