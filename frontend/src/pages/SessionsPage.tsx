import { useEffect, useState, useCallback } from 'react';
import { useSessionStore, SessionInfo } from '../stores/sessionStore';
import { SessionList, QRCodeModal, CreateSessionModal } from '../components/session';
import api from '../lib/api';

/**
 * SessionsPage - Main page for managing WhatsApp sessions
 * Requirements: 3.1, 3.4, 3.5
 */

export function SessionsPage() {
  const {
    sessions,
    isLoading,
    error,
    fetchSessions,
    createSession,
    stopSession,
    deleteSession,
    restartSession,
    connectWebSocket,
    disconnectWebSocket,
    clearError,
  } = useSessionStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<{ sessionId: string; token: string } | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Fetch sessions and connect WebSocket on mount
  useEffect(() => {
    fetchSessions();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [fetchSessions, connectWebSocket, disconnectWebSocket]);

  // Handle showing QR code
  const handleShowQR = useCallback((session: SessionInfo) => {
    setSelectedSession(session);
    setIsQRModalOpen(true);
  }, []);

  // Handle stop session
  const handleStop = useCallback(async (sessionId: string) => {
    await stopSession(sessionId);
  }, [stopSession]);

  // Handle delete session with confirmation
  const handleDelete = useCallback(async (sessionId: string) => {
    if (confirmDelete === sessionId) {
      await deleteSession(sessionId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(sessionId);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }, [confirmDelete, deleteSession]);

  // Handle restart session
  const handleRestart = useCallback(async (sessionId: string) => {
    await restartSession(sessionId);
  }, [restartSession]);

  // Handle generate token for session
  const handleGenerateToken = useCallback(async (sessionId: string) => {
    setIsGeneratingToken(true);
    try {
      const response = await api.post('/tokens', { 
        name: `Session ${sessionId} Token`
      });
      if (response.data.success) {
        setGeneratedToken({ sessionId, token: response.data.data.token });
      }
    } catch (err) {
      console.error('Failed to generate token:', err);
    } finally {
      setIsGeneratingToken(false);
    }
  }, []);

  // Handle create session
  const handleCreateSession = useCallback(async (sessionId: string, name?: string): Promise<boolean> => {
    const success = await createSession(sessionId, name);
    if (success) {
      // Find the newly created session and show QR modal
      const newSession = useSessionStore.getState().sessions.find(s => s.sessionId === sessionId);
      if (newSession) {
        setSelectedSession(newSession);
        setIsQRModalOpen(true);
      }
    }
    return success;
  }, [createSession]);

  // Update selected session when sessions change (for real-time QR updates)
  useEffect(() => {
    if (selectedSession) {
      const updated = sessions.find(s => s.sessionId === selectedSession.sessionId);
      if (updated) {
        setSelectedSession(updated);
      }
    }
  }, [sessions, selectedSession]);


  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          WhatsApp Sessions
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your WhatsApp connections
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

      {/* Delete confirmation banner */}
      {confirmDelete && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-700 dark:text-yellow-400">
            Click delete again to confirm deletion of session "{confirmDelete}"
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && sessions.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading sessions...</span>
        </div>
      ) : (
        <SessionList
          sessions={sessions}
          isLoading={isLoading || isGeneratingToken}
          onCreateSession={() => setIsCreateModalOpen(true)}
          onShowQR={handleShowQR}
          onStop={handleStop}
          onDelete={handleDelete}
          onRestart={handleRestart}
          onGenerateToken={handleGenerateToken}
        />
      )}

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSession}
        isLoading={isLoading}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        session={selectedSession}
        isOpen={isQRModalOpen}
        onClose={() => {
          setIsQRModalOpen(false);
          setSelectedSession(null);
        }}
      />

      {/* Generated Token Modal */}
      {generatedToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              API Token Generated
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Token for session: {generatedToken.sessionId}
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 mb-4">
              <code className="text-sm text-gray-800 dark:text-gray-200 break-all select-all">
                {generatedToken.token}
              </code>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-4">
              ⚠️ Copy this token now. It won't be shown again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedToken.token);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy Token
              </button>
              <button
                onClick={() => setGeneratedToken(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionsPage;
