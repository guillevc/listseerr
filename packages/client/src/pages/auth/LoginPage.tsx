import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/client/components/ui/card';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { Button } from '@/client/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/client/components/ui/tooltip';
import { useAuth } from '@/client/contexts/auth.context';
import { trpc } from '@/client/lib/trpc';
import { loginUserSchema } from 'shared/presentation/schemas/auth.schema';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      login(data.token, data.user, rememberMe);
      void navigate({ to: '/' });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const result = loginUserSchema.safeParse({
      username,
      password,
      rememberMe,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Validation error');
      return;
    }

    loginMutation.mutate(result.data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <img
              src="/assets/listseerr-light.png"
              alt="Listseerr"
              className="h-12 w-12 dark:hidden"
            />
            <img
              src="/assets/listseerr-dark.png"
              alt="Listseerr"
              className="hidden h-12 w-12 dark:block"
            />
            <span className="text-2xl font-bold">Listseerr</span>
          </div>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access Listseerr</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-destructive-background p-3 text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-border bg-background accent-primary"
                />
                <span>Remember me</span>
              </label>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-not-allowed text-sm text-muted opacity-50">
                      Forgot password?
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Password reset is not available for self-hosted instances</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button type="submit" className="mt-2 w-full" loading={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
