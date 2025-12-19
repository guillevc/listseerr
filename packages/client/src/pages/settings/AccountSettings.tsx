import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { User, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { updateUserCredentialsSchema } from 'shared/presentation/schemas/auth.schema';

export function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const updateCredentialsMutation = trpc.auth.updateCredentials.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your credentials have been updated. Please log in again.',
      });
      void logout().then(() => {
        void navigate({ to: '/login' });
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update credentials',
        variant: 'destructive',
      });
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
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.issues[0]?.message ?? 'Invalid input',
        variant: 'destructive',
      });
      return;
    }

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
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted" />
                  )}
                </Button>
              </div>
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
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted" />
                  )}
                </Button>
              </div>
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
