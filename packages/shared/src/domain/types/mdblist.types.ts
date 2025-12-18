/**
 * MDBList Types
 *
 * Pure TypeScript contracts for MDBList-related data.
 * Schemas must satisfy these types.
 */

export type MdblistApiKeyPrimitive = string;

export interface MdblistConfigPrimitive {
  apiKey: MdblistApiKeyPrimitive;
}
