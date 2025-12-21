import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { CheckSetupStatusResponse } from 'shared/application/dtos';
import type {
  RegisterUserCommand,
  LoginUserCommand,
  ValidateSessionCommand,
  LogoutSessionCommand,
  UpdateUserCredentialsCommand,
} from 'shared/application/dtos';
import type {
  RegisterUserResponse,
  LoginUserResponse,
  ValidateSessionResponse,
  LogoutSessionResponse,
  UpdateUserCredentialsResponse,
} from 'shared/application/dtos';
import {
  registerUserSchema,
  loginUserSchema,
  updateUserCredentialsSchema,
  sessionTokenSchema,
} from 'shared/presentation/schemas';

export interface AuthRouterDeps {
  checkSetupStatusUseCase: IUseCase<void, CheckSetupStatusResponse>;
  registerUserUseCase: IUseCase<RegisterUserCommand, RegisterUserResponse>;
  loginUserUseCase: IUseCase<LoginUserCommand, LoginUserResponse>;
  validateSessionUseCase: IUseCase<ValidateSessionCommand, ValidateSessionResponse>;
  logoutSessionUseCase: IUseCase<LogoutSessionCommand, LogoutSessionResponse>;
  updateUserCredentialsUseCase: IUseCase<
    UpdateUserCredentialsCommand,
    UpdateUserCredentialsResponse
  >;
}

/**
 * Auth Router - Thin presentation layer for authentication
 *
 * All procedures are public (no auth required) since they ARE the auth mechanism.
 *
 * This router:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 */
export function createAuthRouter(deps: AuthRouterDeps) {
  return router({
    /**
     * Check if the application needs initial setup (no users exist)
     * Used to determine if redirect to /register is needed
     */
    checkSetupStatus: publicProcedure.query(async () => {
      return await deps.checkSetupStatusUseCase.execute();
    }),

    /**
     * Register a new user
     * Returns user and session token (auto-login)
     */
    register: publicProcedure.input(registerUserSchema).mutation(async ({ input }) => {
      return await deps.registerUserUseCase.execute(input);
    }),

    /**
     * Login with credentials
     * Returns user and session token
     */
    login: publicProcedure.input(loginUserSchema).mutation(async ({ input }) => {
      return await deps.loginUserUseCase.execute(input);
    }),

    /**
     * Validate a session token
     * Used by frontend to check if user is authenticated
     */
    validateSession: publicProcedure.input(sessionTokenSchema).query(async ({ input }) => {
      return await deps.validateSessionUseCase.execute(input);
    }),

    /**
     * Logout - invalidate session
     */
    logout: publicProcedure.input(sessionTokenSchema).mutation(async ({ input }) => {
      return await deps.logoutSessionUseCase.execute(input);
    }),

    /**
     * Update user credentials (username and/or password)
     * Requires current password for security
     */
    updateCredentials: publicProcedure
      .input(updateUserCredentialsSchema)
      .mutation(async ({ input, ctx }) => {
        return await deps.updateUserCredentialsUseCase.execute({
          ...input,
          userId: ctx.userId,
        });
      }),
  });
}
