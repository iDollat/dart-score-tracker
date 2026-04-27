export type GameMode = 301 | 501;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface PlayerDto {
  id: string;
  name: string;
  createdAt?: string;
}

export type RoomStatus = "WAITING" | "IN_GAME" | "FINISHED" | "CLOSED";
export type GameStatus = "active" | "finished" | string;

export interface RoomClientPlayerDto {
  id: string;
  orderIndex: number;
  player: {
    id?: string;
    name: string;
  };
}

export interface RoomClientDto {
  id: string;
  isHost: boolean;
  name?: string;
  isReady: boolean;
  players: RoomClientPlayerDto[];
}

export interface RoomPlayerDto {
  id: string;
  clientId: string;
  playerId?: string;
  orderIndex: number;
  player: {
    id?: string;
    name: string;
  };
  client?: {
    id: string;
    name?: string;
    isReady?: boolean;
  };
}

export interface PendingDartDto {
  id: string;
  dartIndex: number;
  segment: number;
  multiplier: number;
  score: number;
  x?: number | null;
  y?: number | null;
  angle?: number | null;
  radius?: number | null;
}

export interface GameScoreDto {
  playerId: string;
  name: string;
  startingScore: number;
  currentScore: number;
  finalPosition: number | null;
}

export interface GameDto {
  id: string;
  mode: GameMode;
  status: GameStatus;
  currentPlayerIdx: number;
  currentTurnNumber: number;
  winnerPlayerId: string | null;
  currentRoomPlayer: RoomPlayerDto | null;
  pendingDarts: PendingDartDto[];
  scores: GameScoreDto[];
}

export interface RoomDto {
  id: string;
  code: string;
  status: RoomStatus;
  hostClientId?: string;
  createdAt?: string;
  updatedAt?: string;
  game?: GameDto | null;
  clients?: RoomClientDto[];
  players?: RoomPlayerDto[];
}

export interface RoomMeDto {
  room: {
    id: string;
    code: string;
    status: RoomStatus;
    hostClientId: string;
    gameId?: string | null;
  };
  client: {
    id: string;
    roomId: string;
    name?: string;
    isReady: boolean;
    isHost: boolean;
  };
  players: RoomClientPlayerDto[];
  currentRoomPlayer: {
    id: string;
    orderIndex: number;
    player: {
      id?: string;
      name: string;
    };
  } | null;
  isMyTurn: boolean;
}

export interface CreateRoomResponse {
  room: {
    id: string;
    code: string;
    status: RoomStatus;
    hostClientId: string;
  };
  client: {
    id: string;
    isHost: boolean;
  };
  clientToken: string;
  players: RoomPlayerDto[];
}

export interface JoinRoomResponse {
  room: {
    id: string;
    code: string;
    status: RoomStatus;
  };
  client: {
    id: string;
    isHost: boolean;
  };
  clientToken: string;
  players: RoomPlayerDto[];
}

export interface SaveRoomDartBody {
  roomPlayerId: string;
  segment: number;
  multiplier: number;
  score: number;
  x?: number;
  y?: number;
  angle?: number;
  radius?: number;
}

export interface RoomTurnDto {
  id: string;
  turnNumber: number;
  player: {
    id: string;
    name: string;
  };
  startScore: number;
  scored: number;
  endScore: number;
  bust: boolean;
  darts: Array<{
    dartIndex: number;
    segment: number;
    multiplier: number;
    score: number;
  }>;
}

export interface RoomHistoryDto {
  room: RoomDto;
  game: GameDto;
  turns: RoomTurnDto[];
}

async function request<T>(
  path: string,
  options: RequestInit & { clientToken?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.clientToken) {
    headers.set("x-client-token", options.clientToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;

    try {
      const data = await response.json();
      message = data?.message || data?.error || message;
    } catch {
      // Backend nie zawsze musi zwrócić JSON z błędem.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getPlayers() {
  return request<PlayerDto[]>("/api/players");
}

export function createPlayer(name: string) {
  return request<PlayerDto>("/api/players", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function createRoom(playerIds: string[]) {
  return request<CreateRoomResponse>("/api/rooms", {
    method: "POST",
    body: JSON.stringify({ playerIds }),
  });
}

export function joinRoom(code: string, playerIds: string[]) {
  return request<JoinRoomResponse>(`/api/rooms/${code.toUpperCase()}/join`, {
    method: "POST",
    body: JSON.stringify({ playerIds }),
  });
}

export function getRoom(code: string) {
  return request<RoomDto>(`/api/rooms/${code.toUpperCase()}`);
}

export function getRoomMe(code: string, clientToken: string) {
  return request<RoomMeDto>(`/api/rooms/${code.toUpperCase()}/me`, {
    clientToken,
  });
}

export function setRoomReady(code: string, clientToken: string, isReady: boolean) {
  return request(`/api/rooms/${code.toUpperCase()}/ready`, {
    method: "PATCH",
    clientToken,
    body: JSON.stringify({ isReady }),
  });
}

export function startRoomGame(code: string, clientToken: string, mode: GameMode) {
  return request(`/api/rooms/${code.toUpperCase()}/start`, {
    method: "POST",
    clientToken,
    body: JSON.stringify({ mode }),
  });
}

export function saveRoomDart(code: string, clientToken: string, body: SaveRoomDartBody) {
  return request(`/api/rooms/${code.toUpperCase()}/darts`, {
    method: "POST",
    clientToken,
    body: JSON.stringify(body),
  });
}

export function undoRoomAction(code: string, clientToken: string) {
  return request(`/api/rooms/${code.toUpperCase()}/undo`, {
    method: "POST",
    clientToken,
  });
}

export function getRoomHistory(code: string) {
  return request<RoomHistoryDto>(`/api/rooms/${code.toUpperCase()}/history`);
}

export function restartRoomGame(
  code: string,
  clientToken: string,
  mode?: GameMode,
) {
  return request(`/api/rooms/${code.toUpperCase()}/restart`, {
    method: "POST",
    clientToken,
    body: JSON.stringify({ mode }),
  });
}

export function closeRoom(code: string, clientToken: string) {
  return request(`/api/rooms/${code.toUpperCase()}`, {
    method: "DELETE",
    clientToken,
  });
}

export function leaveRoom(code: string, clientToken: string) {
  return request(`/api/rooms/${code.toUpperCase()}/leave`, {
    method: "POST",
    clientToken,
  });
}