/**
 * StatusBadge - Displays session connection status with color indicator
 * Requirements: 9.4
 */

interface StatusBadgeProps {
  status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
  size?: 'sm' | 'md';
}

const statusConfig = {
  disconnected: {
    label: 'Disconnected',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    textColor: 'text-gray-600 dark:text-gray-400',
    dotColor: 'bg-gray-400',
  },
  connecting: {
    label: 'Connecting',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    dotColor: 'bg-yellow-400 animate-pulse',
  },
  qr: {
    label: 'QR Pending',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    dotColor: 'bg-blue-400 animate-pulse',
  },
  connected: {
    label: 'Connected',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    dotColor: 'bg-green-400',
  },
  error: {
    label: 'Error',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
    dotColor: 'bg-red-400',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${sizeClasses[size]}
      `}
    >
      <span className={`rounded-full ${config.dotColor} ${dotSizeClasses[size]}`} />
      {config.label}
    </span>
  );
}

export default StatusBadge;
