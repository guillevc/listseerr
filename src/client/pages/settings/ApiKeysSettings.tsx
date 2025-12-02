import { useState } from 'react';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

// Placeholder component - will be connected to backend later
export function ApiKeysSettings() {
  // Trakt.tv state
  const [traktClientId, setTraktClientId] = useState('');
  const [traktClientSecret, setTraktClientSecret] = useState('');
  const [showTraktSecret, setShowTraktSecret] = useState(false);
  const [isTraktEditing, setIsTraktEditing] = useState(false);

  // TMDB state
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [showTmdbKey, setShowTmdbKey] = useState(false);
  const [isTmdbEditing, setIsTmdbEditing] = useState(false);

  // Mock saved state for demonstration
  const hasSavedTraktKeys = false;
  const hasSavedTmdbKey = false;

  // Trakt.tv handlers
  const handleTraktSave = () => {
    // TODO: Connect to backend API
    console.log('Saving Trakt.tv API keys:', { traktClientId, traktClientSecret });
    setIsTraktEditing(false);
  };

  const handleTraktEdit = () => {
    setIsTraktEditing(true);
  };

  const handleTraktCancel = () => {
    setIsTraktEditing(false);
    setTraktClientId('');
    setTraktClientSecret('');
  };

  const handleTraktRemove = () => {
    // TODO: Connect to backend API
    console.log('Removing Trakt.tv API keys');
    setTraktClientId('');
    setTraktClientSecret('');
    setIsTraktEditing(false);
  };

  // TMDB handlers
  const handleTmdbSave = () => {
    // TODO: Connect to backend API
    console.log('Saving TMDB API key:', { tmdbApiKey });
    setIsTmdbEditing(false);
  };

  const handleTmdbEdit = () => {
    setIsTmdbEditing(true);
  };

  const handleTmdbCancel = () => {
    setIsTmdbEditing(false);
    setTmdbApiKey('');
  };

  const handleTmdbRemove = () => {
    // TODO: Connect to backend API
    console.log('Removing TMDB API key');
    setTmdbApiKey('');
    setIsTmdbEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">API Keys</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API keys for third-party services
        </p>
      </div>

      <Separator />

      {/* Trakt.tv API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Trakt.tv</CardTitle>
              {hasSavedTraktKeys && !isTraktEditing && (
                <Badge variant="secondary" className="text-xs">
                  Configured
                </Badge>
              )}
            </div>
            {hasSavedTraktKeys && !isTraktEditing && (
              <Button variant="outline" size="sm" onClick={handleTraktEdit}>
                Edit
              </Button>
            )}
          </div>
          <CardDescription>
            Required for syncing public Trakt.tv lists. Get your API keys from{' '}
            <a
              href="https://trakt.tv/oauth/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Trakt.tv API Applications
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!hasSavedTraktKeys || isTraktEditing) && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="trakt-client-id">Client ID</Label>
                <Input
                  id="trakt-client-id"
                  placeholder="Your Trakt.tv Client ID"
                  value={traktClientId}
                  onChange={(e) => setTraktClientId(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="trakt-client-secret">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="trakt-client-secret"
                    type={showTraktSecret ? 'text' : 'password'}
                    placeholder="Your Trakt.tv Client Secret"
                    value={traktClientSecret}
                    onChange={(e) => setTraktClientSecret(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTraktSecret(!showTraktSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTraktSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleTraktSave}>
                  {hasSavedTraktKeys ? 'Update Keys' : 'Save Keys'}
                </Button>
                {isTraktEditing && (
                  <Button variant="outline" onClick={handleTraktCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}

          {hasSavedTraktKeys && !isTraktEditing && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                API keys are configured and secure
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleTraktRemove}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TMDB API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">TMDB</CardTitle>
              {hasSavedTmdbKey && !isTmdbEditing && (
                <Badge variant="secondary" className="text-xs">
                  Configured
                </Badge>
              )}
            </div>
            {hasSavedTmdbKey && !isTmdbEditing && (
              <Button variant="outline" size="sm" onClick={handleTmdbEdit}>
                Edit
              </Button>
            )}
          </div>
          <CardDescription>
            Required for fetching movie and TV show metadata. Get your API key from{' '}
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TMDB API Settings
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!hasSavedTmdbKey || isTmdbEditing) && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="tmdb-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="tmdb-api-key"
                    type={showTmdbKey ? 'text' : 'password'}
                    placeholder="Your TMDB API Key"
                    value={tmdbApiKey}
                    onChange={(e) => setTmdbApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTmdbKey(!showTmdbKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTmdbKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleTmdbSave}>
                  {hasSavedTmdbKey ? 'Update Key' : 'Save Key'}
                </Button>
                {isTmdbEditing && (
                  <Button variant="outline" onClick={handleTmdbCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}

          {hasSavedTmdbKey && !isTmdbEditing && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                API key is configured and secure
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleTmdbRemove}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future API Keys can be added here */}
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">More API integrations coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
