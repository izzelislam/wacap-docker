import { useEffect, useRef } from 'react';
import { MessageData } from '../../stores/messageStore';

/**
 * MessageList - Displays incoming messages in real-time
 * Requirements: 5.1, 5.2
 */

interface MessageListProps {
  messages: MessageData[];
  sessionId?: string;
}

export function MessageList({ messages, sessionId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages by session if provided
  const filteredMessages = sessionId
    ? messages.filter((m) => m.sessionId === sessionId)
    : messages;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length]);

  if (filteredMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="mt-2">No messages yet</p>
          <p className="text-sm">Messages will appear here in real-time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto p-4">
      {filteredMessages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

/**
 * MessageItem - Individual message display
 * Requirements: 5.2
 */
interface MessageItemProps {
  message: MessageData;
}

function MessageItem({ message }: MessageItemProps) {
  const isFromMe = message.isFromMe;
  
  // Format timestamp
  const timestamp = new Date(message.timestamp * 1000);
  const timeString = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const dateString = timestamp.toLocaleDateString();

  // Format sender JID to readable format
  const formatSender = (jid: string): string => {
    if (!jid) return 'Unknown';
    // Remove @s.whatsapp.net or @g.us suffix
    const number = jid.split('@')[0];
    // Format as phone number if it looks like one
    if (/^\d+$/.test(number)) {
      return `+${number}`;
    }
    return number;
  };

  // Get message type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'document':
        return '📄';
      case 'location':
        return '📍';
      case 'contact':
        return '👤';
      case 'sticker':
        return '🎨';
      default:
        return '💬';
    }
  };

  return (
    <div
      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isFromMe
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}
      >
        {/* Sender info (for incoming messages) */}
        {!isFromMe && (
          <div className="text-xs font-medium mb-1 opacity-75">
            {formatSender(message.from)}
          </div>
        )}

        {/* Message type indicator */}
        {message.messageType !== 'text' && message.messageType !== 'conversation' && (
          <div className="flex items-center space-x-1 mb-1">
            <span>{getTypeIcon(message.messageType)}</span>
            <span className="text-xs opacity-75 capitalize">{message.messageType}</span>
          </div>
        )}

        {/* Message body */}
        <div className="break-words whitespace-pre-wrap">
          {message.body || <span className="italic opacity-75">[{message.messageType}]</span>}
        </div>

        {/* Timestamp and session info */}
        <div className={`text-xs mt-1 flex items-center justify-between ${
          isFromMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{dateString} {timeString}</span>
          <span className="ml-2 opacity-75">{message.sessionId}</span>
        </div>
      </div>
    </div>
  );
}

export default MessageList;
