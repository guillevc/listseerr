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
  const [traktClientId, setTraktClientId] = useState('');
  const [traktClientSecret, setTraktClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock saved state for demonstration
  const hasSavedKeys = false;

  const handleSave = () => {
    // TODO: Connect to backend API
    console.log('Saving Trakt.tv API keys:', { traktClientId, traktClientSecret });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTraktClientId('');
    setTraktClientSecret('');
  };

  const handleRemove = () => {
    // TODO: Connect to backend API
    console.log('Removing Trakt.tv API keys');
    setTraktClientId('');
    setTraktClientSecret('');
    setIsEditing(false);
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
              {hasSavedKeys && !isEditing && (
                <Badge variant="secondary" className="text-xs">
                  Configured
                </Badge>
              )}
            </div>
            {hasSavedKeys && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
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
          {(!hasSavedKeys || isEditing) && (
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
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Your Trakt.tv Client Secret"
                    value={traktClientSecret}
                    onChange={(e) => setTraktClientSecret(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave}>
                  {hasSavedKeys ? 'Update Keys' : 'Save Keys'}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}

          {hasSavedKeys && !isEditing && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                API keys are configured and secure
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
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
