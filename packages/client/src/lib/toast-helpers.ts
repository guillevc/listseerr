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
