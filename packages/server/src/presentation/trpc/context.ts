import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { eq } from 'drizzle-orm';
import { DomainError } from 'shared/domain/errors';
import { db } from '@/server/infrastructure/db/client';
import { sessions } from '@/server/infrastructure/db/schema';

const SESSION_COOKIE_NAME = 'session_token';

/**
 * Parse cookies from Cookie header
 */
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name) {
        cookies[name] = valueParts.join('=');
      }
      return cookies;
    },
    {} as Record<string, string>
  );
}

/**
 * Create tRPC context for each request.
 * Extracts userId from session token cookie.
 * Database access is handled via DI containers, not context.
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  const cookieHeader = opts.req.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[SESSION_COOKIE_NAME];

  let userId = 1; // Default fallback for unauthenticated requests

  if (sessionToken) {
    // Validate session and extract userId
    const [session] = await db
      .select({ userId: sessions.userId, expiresAt: sessions.expiresAt })
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    if (session && session.expiresAt > new Date()) {
      userId = session.userId;
    }
  }

  return {
    req: opts.req,
    userId,
  };
}

export type Context = {
  req: Request;
  userId: number;
};

// Initialize tRPC with error handling
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    // If the error is a DomainError, translate it to a BAD_REQUEST
    if (error.cause instanceof DomainError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          code: 'BAD_REQUEST',
        },
        message: error.cause.message,
      };
    }

    return shape;
  },
});

// Granular error-to-code mapping for domain errors
type TRPCErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'INTERNAL_SERVER_ERROR';
const errorCodeMap: Record<string, TRPCErrorCode> = {
  // Validation errors -> BAD_REQUEST
  InvalidProviderError: 'BAD_REQUEST',
  InvalidProviderConfigError: 'BAD_REQUEST',
  InvalidListNameError: 'BAD_REQUEST',
  InvalidListUrlError: 'BAD_REQUEST',
  InvalidMaxItemsError: 'BAD_REQUEST',
  InvalidJellyseerrUrlError: 'BAD_REQUEST',
  InvalidJellyseerrApiKeyError: 'BAD_REQUEST',
  InvalidJellyseerrUserIdError: 'BAD_REQUEST',
  InvalidTraktClientIdError: 'BAD_REQUEST',
  InvalidMdbListApiKeyError: 'BAD_REQUEST',
  InvalidTriggerTypeError: 'BAD_REQUEST',
  InvalidBatchIdError: 'BAD_REQUEST',
  InvalidMediaItemError: 'BAD_REQUEST',
  InvalidExecutionStatusError: 'BAD_REQUEST',
  InvalidMediaAvailabilityError: 'BAD_REQUEST',
  InvalidTraktChartTypeError: 'BAD_REQUEST',
  InvalidMediaTypeError: 'BAD_REQUEST',
  InvalidTraktMediaTypeError: 'BAD_REQUEST',
  InvalidExecutionStatusTransitionError: 'BAD_REQUEST',
  UrlDoesNotMatchProviderError: 'BAD_REQUEST',
  // Not found errors -> NOT_FOUND
  MediaListNotFoundError: 'NOT_FOUND',
  TraktConfigNotFoundError: 'NOT_FOUND',
  MdbListConfigNotFoundError: 'NOT_FOUND',
  JellyseerrConfigNotFoundError: 'NOT_FOUND',
  GeneralSettingsNotFoundError: 'NOT_FOUND',
  ProviderConfigNotFoundError: 'NOT_FOUND',
  ExecutionNotFoundError: 'NOT_FOUND',
  // Business rule violations -> FORBIDDEN
  ProviderNotConfiguredError: 'FORBIDDEN',
  JellyseerrNotConfiguredError: 'FORBIDDEN',
  // Infrastructure errors -> INTERNAL_SERVER_ERROR
  EncryptionError: 'INTERNAL_SERVER_ERROR',
  // Auth errors
  InvalidCredentialsError: 'UNAUTHORIZED',
  SessionNotFoundError: 'UNAUTHORIZED',
  UserAlreadyExistsError: 'CONFLICT',
  UserNotFoundError: 'NOT_FOUND',
  InvalidUsernameError: 'BAD_REQUEST',
  InvalidPasswordError: 'BAD_REQUEST',
  RegistrationDisabledError: 'FORBIDDEN',
};

// Middleware to catch DomainErrors and wrap them in TRPCError
const domainErrorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // If this is a DomainError, wrap it in a TRPCError with appropriate code
    if (error instanceof DomainError) {
      const code = errorCodeMap[error.name] ?? 'BAD_REQUEST';
      throw new TRPCError({
        code,
        message: error.message,
        cause: error,
      });
    }
    // Otherwise, re-throw as-is
    throw error;
  }
});

// Export reusable router and procedure helpers
export const router = t.router;
// Apply domain error middleware to all procedures
export const publicProcedure = t.procedure.use(domainErrorMiddleware);
