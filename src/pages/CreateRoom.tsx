import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";
import { createPlayer, createRoom, getPlayers } from "@/api/roomsApi";
import { PlayerPicker } from "@/components/multiplayer/PlayerPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { normalizePlayerName } from "@/lib/players";
import { saveRoomSession } from "@/lib/roomSession";

export default function CreateRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [lockedPlayerId, setLockedPlayerId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoSelectedUserPlayerRef = useRef(false);

  useEffect(() => {
    if (!user?.displayName) return;
    if (autoSelectedUserPlayerRef.current) return;
    if (selectedPlayerIds.length > 0) return;

    let cancelled = false;

    const autoSelectUserPlayer = async () => {
      try {
        const userPlayerName = user.displayName.trim();

        if (!userPlayerName) return;

        const players = await getPlayers();

        if (cancelled) return;

        const existingPlayer = players.find(
          (player) =>
            normalizePlayerName(player.name) ===
            normalizePlayerName(userPlayerName),
        );

        if (existingPlayer) {
          autoSelectedUserPlayerRef.current = true;
          setLockedPlayerId(existingPlayer.id);
          setSelectedPlayerIds([existingPlayer.id]);
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
  }, [user?.displayName, selectedPlayerIds.length]);

  const handleSelectedPlayerIdsChange = useCallback(
    (nextPlayerIds: string[]) => {
      if (!lockedPlayerId) {
        setSelectedPlayerIds(nextPlayerIds);
        return;
      }

      setSelectedPlayerIds(
        nextPlayerIds.includes(lockedPlayerId)
          ? nextPlayerIds
          : [lockedPlayerId, ...nextPlayerIds],
      );
    },
    [lockedPlayerId],
  );

  const handleCreateRoom = async () => {
    if (selectedPlayerIds.length === 0) {
      setError("Wybierz przynajmniej jednego gracza.");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await createRoom(selectedPlayerIds);

      saveRoomSession({
        roomCode: response.room.code,
        clientToken: response.clientToken,
        clientId: response.client.id,
        clientRole: response.client.role ?? "PLAYER",
      });

      navigate(`/rooms/${response.room.code}/lobby`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się stworzyć pokoju",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć
        </Button>

        <Card className="p-5 sm:p-6 bg-card/80 border-border/70">
          <h1 className="font-display text-3xl font-bold mb-2">Stwórz pokój</h1>

          <p className="text-sm text-muted-foreground">
            Wybierz graczy kontrolowanych na tym urządzeniu.
          </p>
        </Card>

        <PlayerPicker
          selectedPlayerIds={selectedPlayerIds}
          onChange={handleSelectedPlayerIdsChange}
        />

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full font-display text-lg uppercase tracking-wide bg-gradient-primary shadow-glow"
          onClick={handleCreateRoom}
          disabled={creating || selectedPlayerIds.length === 0}
        >
          {creating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <PlusCircle className="w-5 h-5 mr-2" />
          )}
          Stwórz pokój
        </Button>
      </div>
    </main>
  );
}
