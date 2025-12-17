import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import {
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  KeyIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, color, isLoading }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          {isLoading ? (
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { sessions, isLoading, fetchSessions, connectWebSocket, disconnectWebSocket } = useSessionStore();

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, [fetchSessions, connectWebSocket, disconnectWebSocket]);

  // Calculate stats
  const totalSessions = sessions.length;
  const connectedSessions = sessions.filter(s => s.status === 'connected').length;
  const activeSessions = sessions.filter(s => s.status !== 'disconnected' && s.status !== 'error').length;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Logged in as {user?.email}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={totalSessions}
          icon={DevicePhoneMobileIcon}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Sessions"
          value={activeSessions}
          icon={ChatBubbleLeftRightIcon}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Connected"
          value={connectedSessions}
          icon={SignalIcon}
          color="orange"
          isLoading={isLoading}
        />
        <StatCard
          title="Disconnected"
          value={totalSessions - activeSessions}
          icon={KeyIcon}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/sessions"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <DevicePhoneMobileIcon className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">Create New Session</span>
          </a>
          <a
            href="/messages"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">Send Message</span>
          </a>
          <a
            href="/tokens"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <KeyIcon className="w-5 h-5 text-purple-500" />
            <span className="text-gray-700 dark:text-gray-300">Manage Tokens</span>
          </a>
        </div>
      </div>

      {/* Info section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
          Getting Started
        </h3>
        <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
          Create a new WhatsApp session to start sending and receiving messages. 
          You'll need to scan a QR code with your WhatsApp mobile app to connect.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;
