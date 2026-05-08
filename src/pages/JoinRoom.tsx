import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DoorOpen, Eye, Loader2 } from "lucide-react";
import {
  createPlayer,
  getPlayers,
  getRoom,
  joinRoom,
  joinRoomAsSpectator,
  type RoomDto,
} from "@/api/roomsApi";
import { PlayerPicker } from "@/components/multiplayer/PlayerPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { normalizePlayerName } from "@/lib/players";
import { saveRoomSession } from "@/lib/roomSession";

export default function JoinRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<RoomDto | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [lockedPlayerId, setLockedPlayerId] = useState<string | null>(null);
  const [excludedPlayerIds, setExcludedPlayerIds] = useState<string[]>([]);
  const [joiningAsPlayer, setJoiningAsPlayer] = useState(false);
  const [joiningAsSpectator, setJoiningAsSpectator] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(false);
  const [roomCheckError, setRoomCheckError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autoSelectedUserPlayerRef = useRef(false);

  const normalizedRoomCode = roomCode.trim().toUpperCase();
  const canCheckRoom = normalizedRoomCode.length >= 5;
  const roomCanAcceptPlayers = room?.status === "WAITING";
  const busy = joiningAsPlayer || joiningAsSpectator;

  const handleSelectedPlayerIdsChange = useCallback(
    (nextPlayerIds: string[]) => {
      if (!lockedPlayerId) {
        setSelectedPlayerIds(nextPlayerIds);
        return;
      }

      const nextIdsWithoutDuplicates = Array.from(
        new Set(
          nextPlayerIds.includes(lockedPlayerId)
            ? nextPlayerIds
            : [lockedPlayerId, ...nextPlayerIds],
        ),
      );

      setSelectedPlayerIds(nextIdsWithoutDuplicates);
    },
    [lockedPlayerId],
  );

  useEffect(() => {
    autoSelectedUserPlayerRef.current = false;

    setRoom(null);
    setExcludedPlayerIds([]);
    setSelectedPlayerIds([]);
    setLockedPlayerId(null);
    setRoomCheckError(null);
    setError(null);

    if (!canCheckRoom) {
      return;
    }

    let cancelled = false;

    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          setCheckingRoom(true);
          setRoomCheckError(null);

          const roomData = await getRoom(normalizedRoomCode);

          if (cancelled) return;

          setRoom(roomData);

          const playerIdsInRoom =
            roomData.players
              ?.map((roomPlayer) => roomPlayer.player.id)
              .filter((playerId): playerId is string => Boolean(playerId)) ??
            [];

          setExcludedPlayerIds(playerIdsInRoom);
        } catch (err) {
          if (cancelled) return;

          setRoom(null);
          setExcludedPlayerIds([]);
          setRoomCheckError(
            err instanceof Error ? err.message : "Nie udało się pobrać pokoju",
          );
        } finally {
          if (!cancelled) {
            setCheckingRoom(false);
          }
        }
      })();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [normalizedRoomCode, canCheckRoom]);

  useEffect(() => {
    if (!user?.displayName) return;
    if (!room) return;
    if (!roomCanAcceptPlayers) return;
    if (autoSelectedUserPlayerRef.current) return;
    if (selectedPlayerIds.length > 0) return;

    let cancelled = false;

    const autoSelectUserPlayer = async () => {
      try {
        const userPlayerName = user.displayName.trim();

        if (!userPlayerName) return;

        const players = await getPlayers();

        if (cancelled) return;

        const normalizedUserPlayerName = normalizePlayerName(userPlayerName);

        const existingAvailablePlayer = players.find(
          (player) =>
            normalizePlayerName(player.name) === normalizedUserPlayerName &&
            !excludedPlayerIds.includes(player.id),
        );

        if (existingAvailablePlayer) {
          autoSelectedUserPlayerRef.current = true;
          setLockedPlayerId(existingAvailablePlayer.id);
          setSelectedPlayerIds([existingAvailablePlayer.id]);
          return;
        }

        const existingPlayerAlreadyInRoom = players.find(
          (player) =>
            normalizePlayerName(player.name) === normalizedUserPlayerName &&
            excludedPlayerIds.includes(player.id),
        );

        if (existingPlayerAlreadyInRoom) {
          autoSelectedUserPlayerRef.current = true;
          setError(
            "Gracz z nazwą Twojego konta jest już w tym pokoju. Możesz dołączyć jako widz albo wybrać innego gracza.",
          );
          return;
        }

        const createdPlayer = await createPlayer(userPlayerName);

        if (cancelled) return;

        autoSelectedUserPlayerRef.current = true;
        setLockedPlayerId(createdPlayer.id);
        setSelectedPlayerIds([createdPlayer.id]);
      } catch (err) {
        console.error("Failed to auto-select user player:", err);
      }
    };

    void autoSelectUserPlayer();

    return () => {
      cancelled = true;
    };
  }, [
    user?.displayName,
    room,
    roomCanAcceptPlayers,
    selectedPlayerIds.length,
    excludedPlayerIds,
  ]);

  const getTargetRoute = (responseRoom: { code: string; status: string }) => {
    return responseRoom.status === "IN_GAME" ||
      responseRoom.status === "FINISHED"
      ? `/rooms/${responseRoom.code}/game`
      : `/rooms/${responseRoom.code}/lobby`;
  };

  const handleJoinRoom = async () => {
    const code = normalizedRoomCode;

    if (!code) {
      setError("Wpisz kod pokoju.");
      return;
    }

    if (!room) {
      setError("Najpierw wpisz poprawny kod istniejącego pokoju.");
      return;
    }

    if (!roomCanAcceptPlayers) {
      setError("Do tego pokoju można teraz dołączyć tylko jako widz.");
      return;
    }

    if (selectedPlayerIds.length === 0) {
      setError("Wybierz przynajmniej jednego gracza albo dołącz jako widz.");
      return;
    }

    try {
      setJoiningAsPlayer(true);
      setError(null);

      const response = await joinRoom(code, selectedPlayerIds);

      saveRoomSession({
        roomCode: response.room.code,
        clientToken: response.clientToken,
        clientId: response.client.id,
        clientRole: response.client.role ?? "PLAYER",
      });

      navigate(getTargetRoute(response.room));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się dołączyć do pokoju",
      );
    } finally {
      setJoiningAsPlayer(false);
    }
  };

  const handleJoinAsSpectator = async () => {
    const code = normalizedRoomCode;

    if (!code) {
      setError("Wpisz kod pokoju.");
      return;
    }

    if (!room) {
      setError("Najpierw wpisz poprawny kod istniejącego pokoju.");
      return;
    }

    try {
      setJoiningAsSpectator(true);
      setError(null);

      const response = await joinRoomAsSpectator(code);

      saveRoomSession({
        roomCode: response.room.code,
        clientToken: response.clientToken,
        clientId: response.client.id,
        clientRole: response.client.role ?? "SPECTATOR",
      });

      navigate(getTargetRoute(response.room));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się dołączyć jako widz",
      );
    } finally {
      setJoiningAsSpectator(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć
        </Button>

        <Card className="p-5 sm:p-6 bg-card/80 border-border/70 space-y-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Dołącz do pokoju
            </h1>

            <p className="text-sm text-muted-foreground">
              Wpisz kod pokoju. Możesz dołączyć jako gracz w lobby albo jako
              widz w dowolnym momencie gry.
            </p>
          </div>

          <Input
            value={roomCode}
            onChange={(event) => {
              setRoomCode(
                event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
              );
            }}
            placeholder="WPISZ TUTAJ KOD POKOJU"
            maxLength={8}
            className="bg-secondary/50 font-display text-2xl tracking-widest uppercase text-center h-14"
          />

          {checkingRoom && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sprawdzanie pokoju...
            </div>
          )}

          {roomCheckError && canCheckRoom && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {roomCheckError}
            </div>
          )}

          {room && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
              Znaleziono pokój <span className="font-bold">{room.code}</span>.
              <span className="ml-1">Status: {room.status}</span>
              {!roomCanAcceptPlayers && (
                <div className="mt-1 text-xs">
                  Gra już trwa albo jest zakończona — możesz dołączyć jako widz.
                </div>
              )}
            </div>
          )}
        </Card>

        {room && roomCanAcceptPlayers && (
          <PlayerPicker
            selectedPlayerIds={selectedPlayerIds}
            onChange={handleSelectedPlayerIdsChange}
            excludedPlayerIds={excludedPlayerIds}
          />
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            size="lg"
            className="w-full font-display text-lg uppercase tracking-wide bg-gradient-primary shadow-glow"
            onClick={handleJoinRoom}
            disabled={
              busy ||
              checkingRoom ||
              !room ||
              !roomCanAcceptPlayers ||
              selectedPlayerIds.length === 0 ||
              Boolean(roomCheckError)
            }
          >
            {joiningAsPlayer ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <DoorOpen className="w-5 h-5 mr-2" />
            )}
            Dołącz jako gracz
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full font-display text-lg uppercase tracking-wide"
            onClick={handleJoinAsSpectator}
            disabled={busy || checkingRoom || !room || Boolean(roomCheckError)}
          >
            {joiningAsSpectator ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Eye className="w-5 h-5 mr-2" />
            )}
            Dołącz jako widz
          </Button>
        </div>
      </div>
    </main>
  );
}