import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { User, Info } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { useAuth } from '../../hooks/use-auth';
import { handleValidationResult, showSuccessToast, showErrorToast } from '../../lib/toast-helpers';
import { updateUserCredentialsSchema } from 'shared/presentation/schemas';

export function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updateCredentialsMutation = trpc.auth.updateCredentials.useMutation({
    onSuccess: () => {
      showSuccessToast(
        toast,
        'Success',
        'Your credentials have been updated. Please log in again.'
      );
      void logout().then(() => {
        void navigate({ to: '/login' });
      });
    },
    onError: (error) => {
      showErrorToast(toast, error.message || 'Failed to update credentials');
    },
  });
  const isSaving = useMinLoading(updateCredentialsMutation.isPending);

  const handleSave = () => {
    const data = {
      currentPassword,
      newUsername: newUsername.trim() || undefined,
      newPassword: newPassword || undefined,
    };

    const result = updateUserCredentialsSchema.safeParse(data);
    if (!handleValidationResult(toast, result, 'Invalid input')) return;

    updateCredentialsMutation.mutate(result.data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Account</h3>
        <p className="mt-1 text-sm text-muted">Manage your account.</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h4 className="text-base font-medium">Change credentials</h4>
          <p className="mt-1 text-sm text-muted">
            Enter your current password to save changes. You'll be logged out after.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Left column: Current credentials */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentUsername">Current username</Label>
              <Input id="currentUsername" value={user?.username ?? ''} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <PasswordInput
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
          </div>

          {/* Right column: New credentials */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="newUsername">New username</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Leave empty to keep your current username</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="newPassword">New password</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Leave empty to keep your current password</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} loading={isSaving}>
            <User className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
