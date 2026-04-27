import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Loader2,
  Play,
  RefreshCcw,
  Users,
} from "lucide-react";
import {
  leaveRoom,
  setRoomReady,
  startRoomGame,
  transferRoomHost,
  type GameMode,
  type RoomClientDto,
} from "@/api/roomsApi";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [hostTransferTarget, setHostTransferTarget] =
    useState<RoomClientDto | null>(null);

  const allClientsReady = room?.clients?.length
    ? room.clients.every((client) => client.isReady)
    : false;

  const isHost = Boolean(me?.client.isHost);

  useEffect(() => {
    if (room?.status === "IN_GAME") {
      navigate(`/rooms/${room.code}/game`, { replace: true });
    }
  }, [room?.status, room?.code, navigate]);

  const transferTargetNames = useMemo(() => {
    if (!hostTransferTarget) return "";

    return hostTransferTarget.players
      .map((roomPlayer) => roomPlayer.player.name)
      .join(", ");
  }, [hostTransferTarget]);

  const getClientPlayerNames = (client: RoomClientDto) => {
    const names = client.players
      .map((roomPlayer) => roomPlayer.player.name)
      .filter(Boolean);

    return names.length > 0 ? names.join(", ") : client.name || "Klient";
  };

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

  const handleTransferHost = async () => {
    if (!hostTransferTarget) return;

    try {
      setBusy(true);
      setActionError(null);

      await transferRoomHost(roomCode, token, hostTransferTarget.id);
      setHostTransferTarget(null);

      // Po zmianie hosta trzeba odświeżyć /me, bo me.client.isHost się zmienia.
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nie udało się przekazać hosta",
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
            <Button
              onClick={() => {
                clearRoomSession();
                navigate("/");
              }}
            >
              Wróć do startu
            </Button>
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Opuść
          </Button>

          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Odśwież
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
              Gracze w pokoju
            </h2>
          </div>

          <div className="grid gap-3">
            {room.clients?.map((client) => {
              const clientIsHost = client.id === room.hostClientId;
              const isMe = client.id === me.client.id;
              const canTransferHost = isHost && !isMe && !clientIsHost;
              const playerNames = getClientPlayerNames(client);

              return (
                <div
                  key={client.id}
                  className={cn(
                    "group relative rounded-xl border p-3 bg-secondary/25 transition-all",
                    isMe && "border-primary bg-primary/5",
                    clientIsHost && "border-amber-400/60 bg-amber-400/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-display text-lg font-bold leading-tight">
                        {clientIsHost && (
                          <Crown className="w-5 h-5 shrink-0 fill-amber-400 text-amber-400 drop-shadow" />
                        )}

                        <span className="truncate">{playerNames}</span>

                        {isMe && (
                          <span className="text-sm text-primary font-normal">
                            — Ty
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        {client.players.length > 1
                          ? `${client.players.length} graczy z tej przeglądarki`
                          : "1 gracz z tej przeglądarki"}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {canTransferHost && (
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setHostTransferTarget(client)}
                            className={cn(
                              "peer inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-400 text-amber-400",
                              "bg-background/80 opacity-0 transition-all",
                              "group-hover:opacity-100",
                              "hover:bg-amber-400 hover:text-amber-950 hover:shadow-glow",
                              "disabled:pointer-events-none disabled:opacity-40",
                            )}
                            aria-label={`Przekaż hosta dla ${playerNames}`}
                          >
                            <Crown className="w-5 h-5 peer-hover:fill-current" />
                          </button>

                          <div className="pointer-events-none absolute right-0 top-11 z-20 w-max rounded-lg border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity peer-hover:opacity-100">
                            Przekaż hosta
                          </div>
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-display uppercase",
                          client.isReady
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-border bg-background/60 text-muted-foreground",
                        )}
                      >
                        {client.isReady ? "Gotowy" : "Nie gotowy"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-card/70 border-border/70 space-y-3 flex flex-col justify-between">
            <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground">
              Twoja gotowość
            </h2>
            <p className="text-sm text-muted-foreground">
              Kliknij jeśli jesteś gotowy. Gotowość wszystkich graczy jest wymagana do startu gry.
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
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
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
          me.client.isHost
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

      <ConfirmModal
        open={!!hostTransferTarget}
        title="Przekazać hosta?"
        description={`Czy na pewno chcesz przekazać hosta klientowi: ${transferTargetNames}? Po tej zmianie to ten klient będzie mógł startować grę i zarządzać pokojem.`}
        confirmText="Tak, przekaż"
        cancelText="Anuluj"
        onCancel={() => setHostTransferTarget(null)}
        onConfirm={() => {
          void handleTransferHost();
        }}
      />
    </main>
  );
}
