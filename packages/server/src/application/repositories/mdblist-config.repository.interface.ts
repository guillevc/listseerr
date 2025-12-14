import type { MdbListConfig } from '@/server/domain/entities/mdblist-config.entity';

/**
 * MdbListConfig Repository Interface (Port)
 *
 * Defines the contract for MDBList configuration persistence.
 * Infrastructure layer provides the concrete implementation.
 */
export interface IMdbListConfigRepository {
  findByUserId(userId: number): Promise<MdbListConfig | null>;
  save(entity: MdbListConfig): Promise<MdbListConfig>;
  delete(entity: MdbListConfig): Promise<void>;
}
