/**
 * Provider Configuration Core DTO
 *
 * Represents the serialized form of a ProviderConfig entity.
 * Contains only primitives - all Value Objects are unwrapped.
 *
 * Used by:
 * - ProviderConfig entity toDTO() method
 * - Provider config use cases
 * - tRPC router outputs
 */
export interface ProviderConfigDTO {
  id: number;
  userId: number;
  provider: string;
  clientId: string | null;
  apiKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}
