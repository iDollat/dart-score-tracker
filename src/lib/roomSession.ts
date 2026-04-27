import type { RoomClientRole } from "@/api/roomsApi";

const ROOM_CODE_KEY = "dart-room-code";
const CLIENT_TOKEN_KEY = "dart-client-token";
const CLIENT_ID_KEY = "dart-client-id";
const CLIENT_ROLE_KEY = "dart-client-role";

export interface RoomSession {
  roomCode: string;
  clientToken: string;
  clientId: string;
  clientRole: RoomClientRole;
}

export function saveRoomSession(session: RoomSession) {
  localStorage.setItem(ROOM_CODE_KEY, session.roomCode);
  localStorage.setItem(CLIENT_TOKEN_KEY, session.clientToken);
  localStorage.setItem(CLIENT_ID_KEY, session.clientId);
  localStorage.setItem(CLIENT_ROLE_KEY, session.clientRole);
}

export function getRoomSession(): RoomSession | null {
  const roomCode = localStorage.getItem(ROOM_CODE_KEY);
  const clientToken = localStorage.getItem(CLIENT_TOKEN_KEY);
  const clientId = localStorage.getItem(CLIENT_ID_KEY);
  const clientRole =
    (localStorage.getItem(CLIENT_ROLE_KEY) as RoomClientRole | null) ?? "PLAYER";

  if (!roomCode || !clientToken || !clientId) {
    return null;
  }

  return { roomCode, clientToken, clientId, clientRole };
}

export function clearRoomSession() {
  localStorage.removeItem(ROOM_CODE_KEY);
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_ID_KEY);
  localStorage.removeItem(CLIENT_ROLE_KEY);
}
