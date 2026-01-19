import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { HelpCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';
import { Input } from '@/client/components/ui/input';
import { PasswordInput } from '@/client/components/ui/password-input';
import { Label } from '@/client/components/ui/label';
import { Button } from '@/client/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/client/components/ui/tooltip';
import { useAuth } from '@/client/hooks/use-auth';
import { trpc } from '@/client/lib/trpc';
import { loginUserSchema } from 'shared/presentation/schemas';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const helpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHelpMouseEnter = () => {
    if (helpTimeoutRef.current) {
      clearTimeout(helpTimeoutRef.current);
      helpTimeoutRef.current = null;
    }
    setShowPasswordHelp(true);
  };

  const handleHelpMouseLeave = () => {
    helpTimeoutRef.current = setTimeout(() => {
      setShowPasswordHelp(false);
    }, 150);
  };

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
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/assets/listseerr-light.png"
            alt="Listseerr"
            className="h-16 w-16 dark:hidden"
          />
          <img
            src="/assets/listseerr-dark.png"
            alt="Listseerr"
            className="hidden h-16 w-16 dark:block"
          />
          <span className="text-2xl font-bold">Listseerr</span>
        </div>
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
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
                  placeholder="Username"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
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

                <TooltipProvider delayDuration={0}>
                  <Tooltip open={showPasswordHelp}>
                    <TooltipTrigger asChild>
                      <span
                        className="inline-flex cursor-help items-center gap-1 text-sm"
                        onMouseEnter={handleHelpMouseEnter}
                        onMouseLeave={handleHelpMouseLeave}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        Forgot credentials?
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      className="border-card-active max-w-xs border"
                      onMouseEnter={handleHelpMouseEnter}
                      onMouseLeave={handleHelpMouseLeave}
                    >
                      <div className="space-y-2 text-xs">
                        <p className="text-muted">Docker:</p>
                        <code className="block rounded bg-card px-3 py-2 font-mono text-foreground">
                          docker exec -it listseerr bun /app/dist/reset-password.js
                        </code>
                        <p className="text-muted">Locally:</p>
                        <code className="block rounded bg-card px-3 py-2 font-mono text-foreground">
                          bun run password:reset
                        </code>
                      </div>
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
    </div>
  );
}
