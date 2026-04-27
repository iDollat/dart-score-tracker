import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Play,
  RefreshCcw,
  Users,
} from "lucide-react";
import {
  setRoomReady,
  startRoomGame,
  leaveRoom,
  type GameMode,
} from "@/api/roomsApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useRoomPolling } from "@/hooks/useRoomPolling";
import { clearRoomSession, getRoomSession } from "@/lib/roomSession";
import { cn } from "@/lib/utils";

export default function RoomLobby() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const session = getRoomSession();
  const token = session?.clientToken || "";
  const roomCode = code || session?.roomCode || "";

  const { room, me, loading, error, refetch } = useRoomPolling({
    code: roomCode,
    token,
    intervalMs: 1500,
  });

  const [mode, setMode] = useState<GameMode>(301);
  const [busy, setBusy] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const allClientsReady = room?.clients?.length
    ? room.clients.every((client) => client.isReady)
    : false;

  useEffect(() => {
    if (room?.status === "IN_GAME") {
      navigate(`/rooms/${room.code}/game`, { replace: true });
    }
  }, [room?.status, room?.code, navigate]);

  const handleLeave = async () => {
    try {
      setBusy(true);
      setActionError(null);

      if (roomCode && token) {
        await leaveRoom(roomCode, token);
      }
    } catch (err) {
      console.error("Failed to leave room:", err);
    } finally {
      clearRoomSession();
      navigate("/", { replace: true });
    }
  };

  const handleToggleReady = async () => {
    if (!me) return;

    try {
      setBusy(true);
      setActionError(null);
      await setRoomReady(roomCode, token, !me.client.isReady);
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nie udało się zmienić gotowości",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleStart = async () => {
    try {
      setBusy(true);
      setActionError(null);
      await startRoomGame(roomCode, token, mode);
      await refetch();
      navigate(`/rooms/${roomCode}/game`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nie udało się wystartować gry",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Brak sesji pokoju</h1>
          <p className="text-sm text-muted-foreground">
            Stwórz pokój albo dołącz do pokoju ponownie.
          </p>
          <Button onClick={() => navigate("/")}>Wróć do startu</Button>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error || !room || !me) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">
            Nie udało się pobrać lobby
          </h1>
          <p className="text-sm text-destructive">
            {error || "Brak danych pokoju"}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => void refetch()}>
              Odśwież
            </Button>
            <Button onClick={handleLeave}>Wróć do startu</Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => setConfirmLeaveOpen(true)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Opuść
          </Button>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Odśwież
          </Button>
        </div>

        <Card className="p-5 sm:p-6 bg-card/80 border-border/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">Lobby pokoju</h1>
              <p className="text-sm text-muted-foreground">
                Status: {room.status}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-primary bg-primary/10 px-5 py-3 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Kod
              </p>
              <p className="font-display text-4xl font-bold text-primary tracking-widest">
                {room.code}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/70 border-border/70">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground">
              Klienci i gracze
            </h2>
          </div>

          <div className="grid gap-3">
            {room.clients?.map((client, index) => (
              <div
                key={client.id}
                className={cn(
                  "rounded-xl border p-3 bg-secondary/25",
                  client.id === me.client.id && "border-primary bg-primary/5",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="font-display uppercase tracking-wide">
                    {client.isHost ? "Host" : `Client ${index + 1}`}
                    {client.id === me.client.id && (
                      <span className="text-primary"> — Ty</span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-display uppercase",
                      client.isReady ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {client.isReady ? "Gotowy" : "Nie gotowy"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {client.players.map((roomPlayer) => (
                    <span
                      key={roomPlayer.id}
                      className="rounded-full bg-background/70 border px-3 py-1 text-sm"
                    >
                      #{roomPlayer.orderIndex + 1} {roomPlayer.player.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-card/70 border-border/70 space-y-3">
            <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground">
              Twoja gotowość
            </h2>
            <p className="text-sm text-muted-foreground">
              Kliknij jeśli jesteś gotowy do gry.
            </p>
            <Button
              className="w-full"
              variant={me.client.isReady ? "outline" : "default"}
              onClick={handleToggleReady}
              disabled={busy}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {me.client.isReady ? "Cofnij gotowość" : "Gotowy"}
            </Button>
          </Card>

          {me.client.isHost && (
            <Card className="p-4 bg-card/70 border-border/70 space-y-3">
              <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground">
                Start gry
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[301, 501].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m as GameMode)}
                    className={cn(
                      "py-4 rounded-xl border-2 font-display text-2xl font-bold transition-all",
                      mode === m
                        ? "border-primary bg-primary/10 text-primary shadow-glow"
                        : "border-border bg-secondary/40 text-muted-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Button
                className="w-full bg-gradient-primary"
                onClick={handleStart}
                disabled={busy || !allClientsReady}
              >
                <Play className="w-4 h-4 mr-2" /> Start
              </Button>
              {!allClientsReady && (
                <p className="text-xs text-muted-foreground text-center">
                  Start będzie aktywny, gdy wszyscy będą gotowi.
                </p>
              )}
            </Card>
          )}
        </div>

        {actionError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmLeaveOpen}
        title="Opuścić pokój?"
        description={
          me?.client.isHost
            ? "Jesteś hostem pokoju. Jeśli są inni gracze, host zostanie przekazany kolejnej osobie. Jeśli jesteś ostatni, pokój zostanie zamknięty."
            : "Zostaniesz usunięty z pokoju razem z graczami kontrolowanymi przez tę przeglądarkę."
        }
        confirmText="Tak, opuść"
        cancelText="Anuluj"
        danger
        onCancel={() => setConfirmLeaveOpen(false)}
        onConfirm={() => {
          setConfirmLeaveOpen(false);
          void handleLeave();
        }}
      />
    </main>
  );
}
