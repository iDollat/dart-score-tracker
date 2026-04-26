const ROOM_CODE_KEY = "dart-room-code";
const CLIENT_TOKEN_KEY = "dart-client-token";
const CLIENT_ID_KEY = "dart-client-id";

export interface RoomSession {
  roomCode: string;
  clientToken: string;
  clientId: string;
}

export function saveRoomSession(session: RoomSession) {
  localStorage.setItem(ROOM_CODE_KEY, session.roomCode);
  localStorage.setItem(CLIENT_TOKEN_KEY, session.clientToken);
  localStorage.setItem(CLIENT_ID_KEY, session.clientId);
}

export function getRoomSession(): RoomSession | null {
  const roomCode = localStorage.getItem(ROOM_CODE_KEY);
  const clientToken = localStorage.getItem(CLIENT_TOKEN_KEY);
  const clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!roomCode || !clientToken || !clientId) {
    return null;
  }

  return { roomCode, clientToken, clientId };
}

export function clearRoomSession() {
  localStorage.removeItem(ROOM_CODE_KEY);
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_ID_KEY);
}