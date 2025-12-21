import type { ToasterToast } from '../hooks/use-toast';

type ToastFn = (props: Omit<ToasterToast, 'id'>) => void;

/**
 * Show a success toast notification.
 */
export function showSuccessToast(toast: ToastFn, title: string, description?: string): void {
  toast({
    title,
    description,
  });
}

/**
 * Show an error toast notification.
 */
export function showErrorToast(toast: ToastFn, error: Error | string): void {
  const message = error instanceof Error ? error.message : error;
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

/**
 * Show a toast for config save operations.
 */
export function showConfigSavedToast(toast: ToastFn, configName: string): void {
  toast({
    title: 'Success',
    description: `${configName} saved successfully`,
  });
}

/**
 * Show a toast for config delete operations.
 */
export function showConfigDeletedToast(toast: ToastFn, configName: string): void {
  toast({
    title: 'Success',
    description: `${configName} removed`,
  });
}
