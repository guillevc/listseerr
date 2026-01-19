import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from './input';
import { cn } from '@/client/lib/utils';

type PasswordInputProps = Omit<InputProps, 'type'> & {
  /** Whether the toggle button should be shown */
  showToggle?: boolean;
};

/**
 * Password input with visibility toggle button.
 * Reduces duplication across login, register, settings, and API key forms.
 */
function PasswordInput({ className, showToggle = true, disabled, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        disabled={disabled}
        {...props}
      />
      {showToggle && !disabled && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export { PasswordInput };
export type { PasswordInputProps };
