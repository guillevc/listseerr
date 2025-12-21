import { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from './input';
import { usePasswordToggle } from '../../hooks/use-password-toggle';
import { cn } from '../../lib/utils';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Show the toggle button */
  showToggle?: boolean;
}

/**
 * Input component for passwords and secrets with visibility toggle.
 * Provides a button to toggle between showing and hiding the value.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, disabled, ...props }, ref) => {
    const { isVisible, toggle, inputType } = usePasswordToggle();

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={inputType}
          className={cn('pr-10', className)}
          disabled={disabled}
          {...props}
        />
        {showToggle && !disabled && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <button
              type="button"
              onClick={toggle}
              className="text-muted hover:text-foreground"
              tabIndex={-1}
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
