import type { JellyseerrUrl } from '../value-objects/jellyseerr-url.value-object';
import type { JellyseerrApiKey } from '../value-objects/jellyseerr-api-key.value-object';
import type { JellyseerrUserId } from '../value-objects/jellyseerr-user-id.value-object';

export interface JellyseerrConfigProps {
  id: number;
  userId: number;
  url: JellyseerrUrl;
  apiKey: JellyseerrApiKey;
  userIdJellyseerr: JellyseerrUserId;
  createdAt: Date;
  updatedAt: Date;
}
