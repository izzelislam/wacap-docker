import { useNavigate } from 'react-router-dom';
import { SessionInfo } from '../../stores/sessionStore';
import { StatusBadge } from './StatusBadge';
import { Cog6ToothIcon, KeyIcon } from '@heroicons/react/24/outline';

/**
 * SessionCard - Displays a single session with status and actions
 * Requirements: 3.1, 9.4
 */

interface SessionCardProps {
  session: SessionInfo;
  onShowQR: (session: SessionInfo) => void;
  onStop: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRestart: (sessionId: string) => void;
  onGenerateToken?: (sessionId: string) => void;
  isLoading?: boolean;
}

export function SessionCard({
  session,
  onShowQR,
  onStop,
  onDelete,
  onRestart,
  onGenerateToken,
  isLoading = false,
}: SessionCardProps) {
  const navigate = useNavigate();
  const canShowQR = session.status === 'qr' || session.status === 'connecting';
  const canStop = session.status === 'connected' || session.status === 'connecting' || session.status === 'qr';
  const canRestart = session.status === 'disconnected' || session.status === 'error';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {session.name || session.sessionId}
            </h3>
            <StatusBadge status={session.status} size="sm" />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ID: {session.sessionId}
          </p>
          
          {session.phoneNumber && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              📱 {session.phoneNumber}
              {session.userName && ` (${session.userName})`}
            </p>
          )}
          
          {session.error && (
            <p className="text-sm text-red-500 mt-1">
              ⚠️ {session.error}
            </p>
          )}
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Created: {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {canShowQR && (
          <button
            onClick={() => onShowQR(session)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
          >
            Show QR
          </button>
        )}
        
        {canRestart && (
          <button
            onClick={() => onRestart(session.sessionId)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 disabled:opacity-50 transition-colors"
          >
            Restart
          </button>
        )}
        
        {canStop && (
          <button
            onClick={() => onStop(session.sessionId)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 disabled:opacity-50 transition-colors"
          >
            Stop
          </button>
        )}
        
        <button
          onClick={() => onDelete(session.sessionId)}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors"
        >
          Delete
        </button>

        {/* Settings & Token buttons */}
        <div className="flex gap-2 ml-auto">
          {onGenerateToken && (
            <button
              onClick={() => onGenerateToken(session.sessionId)}
              disabled={isLoading}
              title="Generate API Token"
              className="p-1.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 transition-colors"
            >
              <KeyIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => navigate(`/sessions/${session.sessionId}/settings`)}
            disabled={isLoading}
            title="Session Settings"
            className="p-1.5 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionCard;
