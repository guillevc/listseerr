import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ExternalLink } from '../ui/external-link';
import { PasswordInput } from '../ui/password-input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export interface ProviderConfigCardProps {
  /** Provider display name (e.g., "Trakt", "MDBList") */
  name: string;
  /** Description text shown below the title */
  description: ReactNode;
  /** URL for the "get API key" link */
  helpUrl: string;
  /** Text for the help link */
  helpLinkText: string;
  /** Input field label */
  inputLabel: string;
  /** Input placeholder text */
  inputPlaceholder: string;
  /** Optional helper text below the input */
  inputHelperText?: string;
  /** Current input value */
  value: string;
  /** Input change handler */
  onChange: (value: string) => void;
  /** Whether the provider is enabled */
  enabled: boolean;
  /** Toggle handler for enable/disable */
  onToggle: (enabled: boolean) => void;
  /** Save button click handler */
  onSave: () => void;
  /** Whether the config has been saved (shows checkmark) */
  isConfigured: boolean;
  /** Whether a mutation is in progress */
  isSaving: boolean;
  /** Whether the input should be disabled */
  isDisabled?: boolean;
  /** Warning message shown when disabled */
  disabledWarning?: string;
}

/**
 * Reusable card component for provider API key configuration.
 * Used by ApiKeysSettings for Trakt, MDBList, and future providers.
 */
export function ProviderConfigCard({
  name,
  description,
  helpUrl,
  helpLinkText,
  inputLabel,
  inputPlaceholder,
  inputHelperText,
  value,
  onChange,
  enabled,
  onToggle,
  onSave,
  isConfigured,
  isSaving,
  isDisabled = false,
  disabledWarning,
}: ProviderConfigCardProps) {
  const showWarning = !enabled && disabledWarning;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Switch
            className="mt-1"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={isDisabled}
          />
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              {name}
              {enabled && isConfigured && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </CardTitle>
            <CardDescription>
              {description} <ExternalLink href={helpUrl}>{helpLinkText}</ExternalLink>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showWarning && (
          <Card variant="warning">
            <CardContent className="flex items-center gap-2 py-3">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{disabledWarning}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-2">
          <Label htmlFor={`${name.toLowerCase()}-input`}>{inputLabel}</Label>
          <PasswordInput
            id={`${name.toLowerCase()}-input`}
            placeholder={inputPlaceholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={!enabled || isDisabled}
            showToggle={enabled}
          />
          {inputHelperText && <p className="text-xs text-muted">{inputHelperText}</p>}
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave} loading={isSaving} disabled={enabled && !value.trim()}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
