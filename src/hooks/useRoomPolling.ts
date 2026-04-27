import { useCallback, useEffect, useRef, useState } from "react";
import {
  getRoom,
  getRoomHistory,
  getRoomMe,
  type RoomDto,
  type RoomHistoryDto,
  type RoomMeDto,
} from "@/api/roomsApi";
import {
  getRoomSocket,
  joinSocketRoom,
  leaveSocketRoom,
  type RoomUpdateEvent,
} from "@/lib/roomSocket";

interface UseRoomPollingOptions {
  code: string;
  token: string;
  includeHistory?: boolean;
  intervalMs?: number;
}

type RefetchMode = "full" | "room-only" | "me-only" | "history-only";

export function useRoomPolling({
  code,
  token,
  includeHistory = false,
}: UseRoomPollingOptions) {
  const normalizedCode = code.toUpperCase();

  const [room, setRoom] = useState<RoomDto | null>(null);
  const [me, setMe] = useState<RoomMeDto | null>(null);
  const [history, setHistory] = useState<RoomHistoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [closed, setClosed] = useState(false);

  const inFlightRef = useRef<Promise<void> | null>(null);

  const refetch = useCallback(
    async (mode: RefetchMode = "full") => {
      if (!normalizedCode || !token || closed) return;

      if (inFlightRef.current) {
        return inFlightRef.current;
      }

      const request = (async () => {
        try {
          setError(null);

          if (mode === "room-only") {
            const roomData = await getRoom(normalizedCode);
            setRoom(roomData);
            return;
          }

          if (mode === "me-only") {
            const meData = await getRoomMe(normalizedCode, token);
            setMe(meData);
            return;
          }

          if (mode === "history-only") {
            if (!includeHistory) return;

            const historyData = await getRoomHistory(normalizedCode).catch(
              () => null,
            );

            setHistory(historyData);
            return;
          }

          const [roomData, meData, historyData] = await Promise.all([
            getRoom(normalizedCode),
            getRoomMe(normalizedCode, token),
            includeHistory
              ? getRoomHistory(normalizedCode).catch(() => null)
              : Promise.resolve(null),
          ]);

          setRoom(roomData);
          setMe(meData);

          if (includeHistory) {
            setHistory(historyData);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Nie udało się pobrać pokoju",
          );
        } finally {
          setLoading(false);
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = request;

      return request;
    },
    [normalizedCode, token, includeHistory, closed],
  );

  useEffect(() => {
    if (!normalizedCode || !token) return;

    const socket = getRoomSocket();

    const handleConnect = () => {
      setConnected(true);
      joinSocketRoom(normalizedCode, token);
      void refetch("full");
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleRoomUpdate = (event: RoomUpdateEvent) => {
      if (event.code?.toUpperCase() !== normalizedCode) return;

      if (event.reason === "ROOM_CLOSED") {
        setClosed(true);
        setRoom(null);
        setMe(null);
        setHistory(null);
        setLoading(false);
        return;
      }

      if (event.room) {
        setRoom(event.room);
        setLoading(false);
      }

      switch (event.reason) {
        case "DART_SAVED":
          break;

        case "TURN_COMPLETED":
        case "GAME_STARTED":
        case "GAME_RESTARTED":
        case "UNDO":
          if (includeHistory) {
            void refetch("history-only");
          }
          break;

        case "READY_CHANGED":
        case "ROOM_JOINED":
        case "ROOM_CREATED":
        case "ROOM_UPDATED":
        default:
          void refetch("me-only");
          break;
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room:update", handleRoomUpdate);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
      void refetch("full");
    }

    return () => {
      leaveSocketRoom(normalizedCode);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room:update", handleRoomUpdate);
    };
  }, [normalizedCode, token, refetch, includeHistory]);

  return {
    room,
    me,
    history,
    loading,
    error,
    connected,
    closed,
    refetch,
  };
}
