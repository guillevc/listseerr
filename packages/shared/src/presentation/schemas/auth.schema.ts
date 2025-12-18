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
} from '../../domain/types/auth.types';

/**
 * Username schema.
 * Validates: non-empty string, trimmed.
 */
export const usernameSchema: z.ZodType<UsernamePrimitive> = z
  .string()
  .min(1, 'Username is required')
  .transform((name) => name.trim())
  .refine((name) => name.length > 0, { message: 'Username cannot be empty' });

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
