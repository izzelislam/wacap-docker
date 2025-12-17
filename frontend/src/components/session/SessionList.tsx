import { SessionInfo } from '../../stores/sessionStore';
import { SessionCard } from './SessionCard';
import { PlusIcon } from '@heroicons/react/24/outline';

/**
 * SessionList - Displays list of sessions with create button
 * Requirements: 3.1, 9.4
 */

interface SessionListProps {
  sessions: SessionInfo[];
  isLoading: boolean;
  onCreateSession: () => void;
  onShowQR: (session: SessionInfo) => void;
  onStop: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRestart: (sessionId: string) => void;
  onGenerateToken?: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  isLoading,
  onCreateSession,
  onShowQR,
  onStop,
  onDelete,
  onRestart,
  onGenerateToken,
}: SessionListProps) {
  if (sessions.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No sessions yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Create your first WhatsApp session to get started
        </p>
        <button
          onClick={onCreateSession}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Create Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sessions ({sessions.length})
        </h2>
        <button
          onClick={onCreateSession}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Session
        </button>
      </div>

      {/* Session grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.sessionId}
            session={session}
            onShowQR={onShowQR}
            onStop={onStop}
            onDelete={onDelete}
            onRestart={onRestart}
            onGenerateToken={onGenerateToken}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

export default SessionList;
