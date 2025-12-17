export { 
  setupWebSocket, 
  broadcast, 
  sendToUser, 
  sendToSession,
  isUserConnected,
  getUserSocketCount,
  getConnectedUsersCount,
  websocketService 
} from './websocket.service';

export {
  setupWacapEventHandlers,
  getSessionStatus,
  updateSessionStatus,
  removeSessionStatus,
  getAllSessionStatuses,
  websocketEvents,
  type QREvent,
  type StatusEvent,
  type ConnectedEvent,
  type DisconnectedEvent,
  type ErrorEvent,
  type MessageEvent,
  type WSEventType
} from './websocket.events';
