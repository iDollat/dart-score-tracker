import { io, type Socket } from "socket.io-client";
import type { RoomDto } from "@/api/roomsApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface RoomUpdateEvent {
  code: string;
  reason?:
    | "ROOM_CREATED"
    | "ROOM_JOINED"
    | "READY_CHANGED"
    | "GAME_STARTED"
    | "GAME_RESTARTED"
    | "DART_SAVED"
    | "TURN_COMPLETED"
    | "UNDO"
    | "ROOM_CLOSED"
    | "ROOM_UPDATED";
  room?: RoomDto | null;
  eventId?: string;
  at?: string;
}

let socket: Socket | null = null;

export function getRoomSocket() {
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 400,
      reconnectionDelayMax: 2500,
    });
  }

  return socket;
}

export function joinSocketRoom(roomCode: string, clientToken: string) {
  getRoomSocket().emit("room:join", {
    code: roomCode.toUpperCase(),
    clientToken,
  });
}

export function leaveSocketRoom(roomCode: string) {
  getRoomSocket().emit("room:leave", {
    code: roomCode.toUpperCase(),
  });
}
