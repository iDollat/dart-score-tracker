import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DoorOpen, Loader2 } from "lucide-react";
import { getRoom, joinRoom, type RoomDto } from "@/api/roomsApi";
import { PlayerPicker } from "@/components/multiplayer/PlayerPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveRoomSession } from "@/lib/roomSession";

export default function JoinRoom() {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<RoomDto | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [excludedPlayerIds, setExcludedPlayerIds] = useState<string[]>([]);
  const [joining, setJoining] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(false);
  const [roomCheckError, setRoomCheckError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedRoomCode = roomCode.trim().toUpperCase();
  const canCheckRoom = normalizedRoomCode.length >= 5;

  useEffect(() => {
    setRoom(null);
    setExcludedPlayerIds([]);
    setSelectedPlayerIds([]);
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
            err instanceof Error
              ? err.message
              : "Nie udało się pobrać pokoju",
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

    if (selectedPlayerIds.length === 0) {
      setError("Wybierz przynajmniej jednego gracza.");
      return;
    }

    try {
      setJoining(true);
      setError(null);

      const response = await joinRoom(code, selectedPlayerIds);

      saveRoomSession({
        roomCode: response.room.code,
        clientToken: response.clientToken,
        clientId: response.client.id,
      });

      navigate(`/rooms/${response.room.code}/lobby`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się dołączyć do pokoju",
      );
    } finally {
      setJoining(false);
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
              Wpisz kod pokoju i wybierz graczy, których będzie kontrolować ta
              przeglądarka.
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
            </div>
          )}
        </Card>

        {room && (
          <PlayerPicker
            selectedPlayerIds={selectedPlayerIds}
            onChange={setSelectedPlayerIds}
            excludedPlayerIds={excludedPlayerIds}
          />
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full font-display text-lg uppercase tracking-wide bg-gradient-primary shadow-glow"
          onClick={handleJoinRoom}
          disabled={
            joining ||
            checkingRoom ||
            !room ||
            selectedPlayerIds.length === 0 ||
            Boolean(roomCheckError)
          }
        >
          {joining ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <DoorOpen className="w-5 h-5 mr-2" />
          )}

          Dołącz
        </Button>
      </div>
    </main>
  );
}