import { DeviceTokens, ThemeToggle } from '../components/settings';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import {
  Cog6ToothIcon,
  UserCircleIcon,
  SunIcon,
  BellAlertIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

/**
 * SettingsPage - User settings and preferences
 * Requirements: 2.1, 9.5
 */
export function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user?.email || 'Not logged in'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Member since</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <SunIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Appearance
          </h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Theme</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toggle between light and dark mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Device Tokens Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cog6ToothIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Access
          </h2>
        </div>
        <DeviceTokens />
      </div>

      {/* API Usage Guide Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CodeBracketIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Usage Guide
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Use your Device Token to authenticate API requests for automation. No login required.
          </p>

          {/* Example Request */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Send Text Message Example:
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 whitespace-pre-wrap">
{`curl -X POST "http://localhost:3000/api/send/text" \\
  -H "Content-Type: application/json" \\
  -H "X-Device-Token: YOUR_DEVICE_TOKEN" \\
  -d '{
    "sessionId": "your-session-id",
    "to": "628123456789",
    "text": "Hello from API!"
  }'`}
              </pre>
            </div>
          </div>

          {/* Available Endpoints */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Available Endpoints:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-mono">
                  POST
                </span>
                <code className="text-gray-700 dark:text-gray-300">/api/send/text</code>
                <span className="text-gray-500">- Send text message</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-mono">
                  POST
                </span>
                <code className="text-gray-700 dark:text-gray-300">/api/send/media</code>
                <span className="text-gray-500">- Send image/video/document</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-mono">
                  POST
                </span>
                <code className="text-gray-700 dark:text-gray-300">/api/send/location</code>
                <span className="text-gray-500">- Send location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-mono">
                  POST
                </span>
                <code className="text-gray-700 dark:text-gray-300">/api/send/contact</code>
                <span className="text-gray-500">- Send contact card</span>
              </div>
            </div>
          </div>

          {/* Authentication Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              💡 Authentication
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Add header <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">X-Device-Token: YOUR_TOKEN</code> to all API requests.
              Generate tokens above or from session settings.
            </p>
          </div>

          {/* Link to API Docs */}
          <div className="pt-2">
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View Full API Documentation →
            </a>
          </div>
        </div>
      </div>

      {/* Webhook Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BellAlertIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Webhooks
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Webhooks are configured per session. Go to a session's settings to configure its webhook.
        </p>
        <Link
          to="/sessions"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Go to Sessions
        </Link>
      </div>
    </div>
  );
}

export default SettingsPage;
