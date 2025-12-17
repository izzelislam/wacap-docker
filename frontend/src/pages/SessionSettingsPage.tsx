import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useWebhookStore, WebhookEventType } from '../stores/webhookStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function SessionSettingsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, fetchSessions } = useSessionStore();
  const {
    webhooks,
    availableEvents,
    isLoading,
    error,
    fetchWebhookBySession,
    fetchEvents,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    clearError,
  } = useWebhookStore();

  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const session = sessions.find((s) => s.sessionId === sessionId);
  const webhook = sessionId ? webhooks.get(sessionId) : null;

  useEffect(() => {
    fetchSessions();
    fetchEvents();
    if (sessionId) {
      fetchWebhookBySession(sessionId);
    }
  }, [sessionId, fetchSessions, fetchEvents, fetchWebhookBySession]);

  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url);
      setSelectedEvents(webhook.events);
      setIsEditing(false);
    } else {
      setUrl('');
      setSelectedEvents([]);
    }
  }, [webhook]);

  const handleEventToggle = (event: WebhookEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!sessionId) return;

    if (webhook) {
      await updateWebhook(webhook.id, { url, events: selectedEvents, secret: secret || undefined });
    } else {
      await createWebhook(sessionId, url, selectedEvents, secret || undefined);
    }
    setSecret('');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (webhook && sessionId && confirm('Delete this webhook?')) {
      await deleteWebhook(webhook.id, sessionId);
      setUrl('');
      setSelectedEvents([]);
    }
  };

  if (!session) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Session not found</p>
        <Button onClick={() => navigate('/sessions')} className="mt-4">Back to Sessions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/sessions')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Session Settings: {session.name || session.sessionId}
          </h1>
          <p className="text-sm text-gray-500">{session.phoneNumber || 'Not connected'}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Webhook Configuration</h2>
        
        {webhook && !isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <p className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg break-all">{webhook.url}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Events ({webhook.events.length})</label>
              <div className="flex flex-wrap gap-2">
                {webhook.events.map((event) => (
                  <span key={event} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-sm">
                    {event}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsEditing(true)} variant="secondary">Edit</Button>
              <Button onClick={handleDelete} variant="danger">Delete</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Webhook URL" type="url" placeholder="https://your-server.com/webhook" value={url} onChange={(e) => setUrl(e.target.value)} required />
            <Input label="Secret (optional)" type="password" placeholder="HMAC secret" value={secret} onChange={(e) => setSecret(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Events</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableEvents.map((event) => (
                  <label key={event.type} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" checked={selectedEvents.includes(event.type)} onChange={() => handleEventToggle(event.type)} className="mt-0.5 rounded" />
                    <div>
                      <p className="text-sm font-medium">{event.type}</p>
                      <p className="text-xs text-gray-500">{event.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isLoading} disabled={selectedEvents.length === 0}>
                {webhook ? 'Update' : 'Create'} Webhook
              </Button>
              {isEditing && <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SessionSettingsPage;
