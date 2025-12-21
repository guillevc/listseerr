/**
 * Auth Schemas
 *
 * Zod schemas for structural validation, typed against domain types.
 * Used by tRPC routers and frontend forms.
 */

import { z } from 'zod';
import type {
  UsernamePrimitive,
  PasswordPrimitive,
  RegisterUserPrimitive,
  LoginUserPrimitive,
  UpdateUserCredentialsPrimitive,
  SessionTokenPrimitive,
} from '../../domain/types/auth.types';
import { createNonEmptyStringSchema } from './common.schema';

/**
 * Username schema.
 * Validates: non-empty string, trimmed.
 */
export const usernameSchema: z.ZodType<UsernamePrimitive> = createNonEmptyStringSchema('Username');

/**
 * Password schema.
 * Validates: non-empty string.
 * Note: Per requirements, only non-empty validation is needed (no complexity requirements).
 */
export const passwordSchema: z.ZodType<PasswordPrimitive> = z
  .string()
  .min(1, 'Password is required');

/**
 * Register user schema.
 * Output type matches RegisterUserPrimitive.
 */
export const registerUserSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }) satisfies z.ZodType<RegisterUserPrimitive>;

/**
 * Login user schema.
 * Output type matches LoginUserPrimitive.
 */
export const loginUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  rememberMe: z.boolean().default(false),
}) satisfies z.ZodType<LoginUserPrimitive>;

/**
 * Update user credentials schema.
 * At least one of newUsername or newPassword must be provided.
 */
export const updateUserCredentialsSchema = z
  .object({
    currentPassword: passwordSchema,
    newUsername: usernameSchema.optional(),
    newPassword: passwordSchema.optional(),
  })
  .refine((data) => data.newUsername || data.newPassword, {
    message: 'At least one of new username or new password must be provided',
  }) satisfies z.ZodType<UpdateUserCredentialsPrimitive>;

/**
 * Session token schema for validation/logout operations.
 */
export const sessionTokenSchema = z.object({
  token: z.string().min(1, 'Session token is required'),
}) satisfies z.ZodType<{ token: SessionTokenPrimitive }>;
