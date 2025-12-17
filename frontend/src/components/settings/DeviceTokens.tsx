import { useState, useEffect, useCallback } from 'react';
import { KeyIcon, TrashIcon, ClipboardIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

/**
 * Device token interface matching backend response
 * Requirements: 2.1, 2.2
 */
interface DeviceToken {
  id: number;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

/**
 * New token response (includes the actual token value)
 */
interface NewTokenResponse {
  id: number;
  name: string;
  token: string;
  created_at: string;
}

/**
 * DeviceTokens component - Manages device tokens for API access
 * Requirements: 2.1, 2.2, 2.3
 */
export function DeviceTokens() {
  const [tokens, setTokens] = useState<DeviceToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<NewTokenResponse | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  /**
   * Fetch all device tokens
   * Requirements: 2.2
   */
  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/tokens');
      if (response.data.success) {
        setTokens(response.data.data.tokens);
      }
    } catch (err) {
      setError('Failed to load device tokens');
      console.error('Error fetching tokens:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  /**
   * Create a new device token
   * Requirements: 2.1
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTokenName.trim()) {
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const response = await api.post('/tokens', { name: newTokenName.trim() });
      
      if (response.data.success) {
        setNewlyCreatedToken(response.data.data);
        setNewTokenName('');
        setShowCreateForm(false);
        await fetchTokens();
      }
    } catch (err) {
      setError('Failed to create device token');
      console.error('Error creating token:', err);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Revoke a device token
   * Requirements: 2.3
   */
  const handleRevoke = async (tokenId: number) => {
    if (confirmDelete !== tokenId) {
      setConfirmDelete(tokenId);
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }

    try {
      setError(null);
      await api.delete(`/tokens/${tokenId}`);
      setConfirmDelete(null);
      await fetchTokens();
      
      // Clear newly created token if it was revoked
      if (newlyCreatedToken?.id === tokenId) {
        setNewlyCreatedToken(null);
      }
    } catch (err) {
      setError('Failed to revoke device token');
      console.error('Error revoking token:', err);
    }
  };

  /**
   * Copy token to clipboard
   */
  const handleCopyToken = async (token: string, tokenId: number) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedTokenId(tokenId);
      setTimeout(() => setCopiedTokenId(null), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Device Tokens
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage API access tokens for external applications
          </p>
        </div>
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            New Token
          </Button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Newly created token display */}
      {newlyCreatedToken && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-green-800 dark:text-green-300">
                Token Created Successfully
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Copy this token now. You won't be able to see it again!
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-green-100 dark:bg-green-900/50 px-3 py-2 rounded text-sm font-mono text-green-900 dark:text-green-200 break-all">
                  {newlyCreatedToken.token}
                </code>
                <button
                  onClick={() => handleCopyToken(newlyCreatedToken.token, newlyCreatedToken.id)}
                  className="p-2 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded"
                  title="Copy token"
                >
                  {copiedTokenId === newlyCreatedToken.id ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewlyCreatedToken(null)}
              className="text-green-500 hover:text-green-700 dark:hover:text-green-300 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Create token form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Token Name"
                placeholder="e.g., My Integration, N8N Workflow"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <Button type="submit" isLoading={isCreating} disabled={!newTokenName.trim()}>
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateForm(false);
                setNewTokenName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Token list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tokens...</span>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <KeyIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">No device tokens yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Create a token to access the API from external applications
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <KeyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {token.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Created: {formatDate(token.created_at)}</span>
                    <span>Last used: {formatDate(token.last_used_at)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRevoke(token.id)}
                className={`p-2 rounded-lg transition-colors ${
                  confirmDelete === token.id
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
                title={confirmDelete === token.id ? 'Click again to confirm' : 'Revoke token'}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete banner */}
      {confirmDelete && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Click the delete button again to confirm revocation
          </p>
        </div>
      )}
    </div>
  );
}

export default DeviceTokens;
