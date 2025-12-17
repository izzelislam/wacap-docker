import { useEffect, useState } from 'react';
import { useSessionStore, SessionInfo } from '../stores/sessionStore';
import { useMessageStore } from '../stores/messageStore';
import { MessageForm, MessageList } from '../components/message';

/**
 * MessagesPage - Main page for sending and viewing WhatsApp messages
 * Requirements: 4.1, 5.1
 */

export function MessagesPage() {
  const {
    sessions,
    fetchSessions,
    connectWebSocket: connectSessionWS,
    disconnectWebSocket: disconnectSessionWS,
  } = useSessionStore();

  const {
    messages,
    connectWebSocket: connectMessageWS,
    disconnectWebSocket: disconnectMessageWS,
    subscribeToSession,
    clearError,
    error,
  } = useMessageStore();

  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch sessions and connect WebSockets on mount
  useEffect(() => {
    fetchSessions();
    connectSessionWS();
    connectMessageWS();

    return () => {
      disconnectSessionWS();
      disconnectMessageWS();
    };
  }, [fetchSessions, connectSessionWS, disconnectSessionWS, connectMessageWS, disconnectMessageWS]);

  // Auto-select first connected session
  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      const connectedSession = sessions.find((s) => s.status === 'connected');
      if (connectedSession) {
        setSelectedSession(connectedSession);
      } else {
        setSelectedSession(sessions[0]);
      }
    }
  }, [sessions, selectedSession]);

  // Subscribe to selected session for incoming messages
  useEffect(() => {
    if (selectedSession) {
      subscribeToSession(selectedSession.sessionId);
    }
  }, [selectedSession, subscribeToSession]);

  // Subscribe to all sessions when they are loaded
  useEffect(() => {
    sessions.forEach((session) => {
      subscribeToSession(session.sessionId);
    });
  }, [sessions, subscribeToSession]);

  // Update selected session when sessions change
  useEffect(() => {
    if (selectedSession) {
      const updated = sessions.find((s) => s.sessionId === selectedSession.sessionId);
      if (updated) {
        setSelectedSession(updated);
      }
    }
  }, [sessions, selectedSession]);

  // Handle message sent success
  const handleMessageSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Get connected sessions for selector
  const connectedSessions = sessions.filter((s) => s.status === 'connected');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Messages
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Send and receive WhatsApp messages
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success notification */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-400">
            ✓ Message sent successfully!
          </p>
        </div>
      )}

      {/* No sessions warning */}
      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No Sessions Available
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a WhatsApp session first to start sending messages.
          </p>
          <a
            href="/sessions"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Sessions
          </a>
        </div>
      ) : connectedSessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No Connected Sessions
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect a WhatsApp session to start sending messages.
          </p>
          <a
            href="/sessions"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Sessions
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Message Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Send Message
            </h2>

            {/* Session Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Session
              </label>
              <select
                value={selectedSession?.sessionId || ''}
                onChange={(e) => {
                  const session = sessions.find((s) => s.sessionId === e.target.value);
                  setSelectedSession(session || null);
                }}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sessions.map((session) => (
                  <option
                    key={session.sessionId}
                    value={session.sessionId}
                    disabled={session.status !== 'connected'}
                  >
                    {session.name || session.sessionId}
                    {session.phoneNumber ? ` (${session.phoneNumber})` : ''}
                    {session.status !== 'connected' ? ` - ${session.status}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Status Indicator */}
            {selectedSession && (
              <div className="mb-4 flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedSession.status === 'connected'
                      ? 'bg-green-500'
                      : selectedSession.status === 'connecting'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {selectedSession.status}
                </span>
                {selectedSession.phoneNumber && (
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    • {selectedSession.phoneNumber}
                  </span>
                )}
              </div>
            )}

            {/* Message Form */}
            {selectedSession && selectedSession.status === 'connected' ? (
              <MessageForm
                session={selectedSession}
                onSuccess={handleMessageSuccess}
              />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Select a connected session to send messages</p>
              </div>
            )}
          </div>

          {/* Incoming Messages Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Incoming Messages
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {messages.length} messages
              </span>
            </div>

            {/* Filter by session toggle */}
            <div className="mb-4 flex items-center space-x-2">
              <input
                type="checkbox"
                id="filterBySession"
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                checked={!!selectedSession}
                onChange={() => {}}
                disabled
              />
              <label
                htmlFor="filterBySession"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Showing messages for: {selectedSession?.name || selectedSession?.sessionId || 'All sessions'}
              </label>
            </div>

            {/* Message List */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <MessageList
                messages={messages}
                sessionId={selectedSession?.sessionId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
