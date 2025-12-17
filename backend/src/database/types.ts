/**
 * User entity representing a registered user
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

/**
 * User without sensitive data (for API responses)
 */
export interface UserPublic {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Device token for API authentication
 */
export interface DeviceToken {
  id: number;
  user_id: number;
  token: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

/**
 * Device token without sensitive token value (for listing)
 */
export interface DeviceTokenPublic {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

/**
 * User session mapping (WhatsApp session ownership)
 */
export interface UserSession {
  id: number;
  user_id: number;
  session_id: string;
  name: string | null;
  created_at: string;
}

/**
 * Message log entry
 */
export interface MessageLog {
  id: number;
  session_id: string;
  direction: 'incoming' | 'outgoing';
  jid: string;
  message_type: string;
  content: string | null;
  timestamp: string;
}

/**
 * Input for creating a new user
 */
export interface CreateUserInput {
  email: string;
  password_hash: string;
}

/**
 * Input for creating a new device token
 */
export interface CreateDeviceTokenInput {
  user_id: number;
  token: string;
  name: string;
}

/**
 * Input for creating a new user session
 */
export interface CreateUserSessionInput {
  user_id: number;
  session_id: string;
  name?: string;
}

/**
 * Input for creating a message log entry
 */
export interface CreateMessageLogInput {
  session_id: string;
  direction: 'incoming' | 'outgoing';
  jid: string;
  message_type: string;
  content?: string;
}
