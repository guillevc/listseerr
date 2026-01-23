import type { ToasterToast } from '../hooks/use-toast';

type ToastFn = (props: Omit<ToasterToast, 'id'>) => void;

/**
 * Show an error toast notification.
 * Accepts Error objects, strings, or any object with a message property (e.g., TRPCClientError).
 */
export function showErrorToast(toast: ToastFn, error: Error | string | { message: string }): void {
  const message = typeof error === 'string' ? error : error.message;
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
}

/**
 * Show a validation error toast notification.
 */
export function showValidationErrorToast(toast: ToastFn, message: string): void {
  toast({
    title: 'Validation Error',
    description: message,
    variant: 'destructive',
  });
}

/**
 * Show a success toast notification.
 */
export function showSuccessToast(toast: ToastFn, title: string, description: string): void {
  toast({
    title,
    description,
  });
}

/**
 * Simplified validation result type for toast handling.
 * Avoids direct dependency on Zod types which cause ESLint issues.
 */
interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  error: {
    issues: Array<{ message: string }>;
  };
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Handle validation result and show error toast if invalid.
 * Compatible with Zod's safeParse return type.
 * Returns true if validation passed, false if failed.
 */
export function handleValidationResult<T>(
  toast: ToastFn,
  result: ValidationResult<T>,
  fallbackMessage = 'Invalid input'
): result is ValidationSuccess<T> {
  if (result.success) {
    return true;
  }
  const firstIssue = result.error.issues[0];
  showValidationErrorToast(toast, firstIssue?.message ?? fallbackMessage);
  return false;
}

/**
 * Create standard mutation callbacks for toast notifications.
 * Reduces boilerplate in useMutation hooks.
 */
export function createMutationCallbacks(
  toast: ToastFn,
  options: {
    onSuccessTitle: string;
    onSuccessDescription: string;
    onErrorFallback?: string;
    onSuccessCallback?: () => void;
  }
) {
  return {
    onSuccess: () => {
      toast({
        title: options.onSuccessTitle,
        description: options.onSuccessDescription,
      });
      options.onSuccessCallback?.();
    },
    onError: (error: { message: string }) => {
      toast({
        title: 'Error',
        description: error.message || options.onErrorFallback || 'An error occurred',
        variant: 'destructive',
      });
    },
  };
}

/**
 * Show a toast for list operations.
 */
export function showListOperationToast(
  toast: ToastFn,
  operation: 'add' | 'edit' | 'delete',
  listName?: string
): void {
  const messages = {
    add: {
      title: 'List Added',
      description: listName ? `${listName} has been added successfully` : 'List added successfully',
    },
    edit: {
      title: 'List Updated',
      description: listName
        ? `${listName} has been updated successfully`
        : 'List updated successfully',
    },
    delete: {
      title: 'List Removed',
      description: 'The list has been removed successfully',
    },
  };

  const { title, description } = messages[operation];
  toast({ title, description });
}
