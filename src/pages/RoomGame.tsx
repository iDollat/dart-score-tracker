import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCcw, Trophy } from "lucide-react";
import { saveRoomDart, undoRoomAction } from "@/api/roomsApi";
import { Dartboard } from "@/components/Dartboard";
import { RoomHistoryPanel } from "@/components/multiplayer/RoomHistoryPanel";
import { RoomScorePanel } from "@/components/multiplayer/RoomScorePanel";
import { RoomTurnControls } from "@/components/multiplayer/RoomTurnControls";
import { TurnSummaryOverlay } from "@/components/TurnSummaryOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRoomPolling } from "@/hooks/useRoomPolling";
import { clearRoomSession, getRoomSession } from "@/lib/roomSession";
import {
  hitToRoomDart,
  pendingDartToHit,
  roomTurnToTurnRecord,
} from "@/lib/roomDarts";
import type { DartHit } from "@/lib/dartboard";
import type { TurnRecord } from "@/lib/gameLogic";

export default function RoomGame() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const session = getRoomSession();
  const token = session?.clientToken || "";
  const roomCode = code || session?.roomCode || "";

  const { room, me, history, loading, error, refetch } = useRoomPolling({
    code: roomCode,
    token,
    includeHistory: true,
    intervalMs: 1200,
  });

  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [optimisticHits, setOptimisticHits] = useState<DartHit[]>([]);
  const [turnSummary, setTurnSummary] = useState<TurnRecord | null>(null);

  const lastShownTurnIdRef = useRef<string | null>(null);
  const initializedHistoryRef = useRef(false);

  const game = room?.game || null;

  const controlledRoomPlayerIds = useMemo(
    () => me?.players.map((player) => player.id) || [],
    [me?.players],
  );

  const currentRoomPlayerId = game?.currentRoomPlayer?.id;

  const isMyTurn = Boolean(
    currentRoomPlayerId && controlledRoomPlayerIds.includes(currentRoomPlayerId),
  );

  const finished = room?.status === "FINISHED" || game?.status === "finished";

  const serverHits = game?.pendingDarts.map(pendingDartToHit) || [];

  const recentHits =
    optimisticHits.length > 0
      ? [...serverHits, ...optimisticHits].slice(0, 3)
      : serverHits;

  const currentPlayerName = game?.currentRoomPlayer?.player?.name || "—";

  const winnerName = game?.scores.find(
    (score) =>
      score.playerId === game.winnerPlayerId || score.finalPosition === 1,
  )?.name;

  useEffect(() => {
    setOptimisticHits([]);
  }, [game?.pendingDarts.length, game?.currentRoomPlayer?.id]);

  useEffect(() => {
    if (!turnSummary) return;

    const timeout = window.setTimeout(() => {
      setTurnSummary(null);
    }, 3800);

    return () => window.clearTimeout(timeout);
  }, [turnSummary]);

  useEffect(() => {
    const turns = history?.turns || [];

    if (turns.length === 0) {
      return;
    }

    const lastTurn = turns[turns.length - 1];

    if (!initializedHistoryRef.current) {
      initializedHistoryRef.current = true;
      lastShownTurnIdRef.current = lastTurn.id;
      return;
    }

    if (lastShownTurnIdRef.current === lastTurn.id) {
      return;
    }

    lastShownTurnIdRef.current = lastTurn.id;
    setTurnSummary(roomTurnToTurnRecord(lastTurn));
  }, [history?.turns]);

  const handleLeave = () => {
    clearRoomSession();
    navigate("/");
  };

  const handleHit = async (hit: DartHit) => {
    if (!game?.currentRoomPlayer?.id || !isMyTurn || finished || busy) return;

    try {
      setBusy(true);
      setActionError(null);

      setOptimisticHits((prev) => [...prev, hit].slice(0, 3));

      await saveRoomDart(
        roomCode,
        token,
        hitToRoomDart(game.currentRoomPlayer.id, hit),
      );

      // Nie robimy tutaj GET /room.
      // Backend wysyła room:update przez Socket.IO.
      setOptimisticHits([]);
    } catch (err) {
      setOptimisticHits([]);
      setActionError(
        err instanceof Error ? err.message : "Nie udało się zapisać rzutu",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUndo = async () => {
    if (busy || finished) return;

    try {
      setBusy(true);
      setActionError(null);

      await undoRoomAction(roomCode, token);

      // Po undo socket powinien wysłać update.
      // Ten refetch zostawiamy jako bezpieczny fallback dla historii.
      await refetch("history-only" as never);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nie udało się cofnąć rzutu",
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
            Do gry multiplayer potrzebny jest zapisany clientToken.
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

  if (error || !room || !me || !game) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">
            Gra nie jest jeszcze aktywna
          </h1>
          <p className="text-sm text-destructive">
            {error || "Brak danych gry"}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => void refetch()}>
              Odśwież
            </Button>
            <Button onClick={() => navigate(`/rooms/${roomCode}/lobby`)}>
              Do lobby
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-3 sm:p-5 max-w-7xl mx-auto overflow-x-hidden">
      <header className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h1 className="font-display text-xl font-bold leading-none">
            Pokój <span className="text-primary">{room.code}</span> ·{" "}
            {game.mode}
          </h1>
          <p className="text-xs text-muted-foreground">
            {finished
              ? "Gra zakończona"
              : isMyTurn
                ? "Twoja kolej"
                : `Teraz rzuca: ${currentPlayerName}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            <RefreshCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Odśwież</span>
          </Button>

          <Button size="sm" variant="ghost" onClick={handleLeave}>
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Wyjdź</span>
          </Button>
        </div>
      </header>

      {finished && (
        <Card className="mb-4 p-4 border-success bg-success/10 text-center">
          <Trophy className="w-8 h-8 mx-auto text-accent mb-2" />
          <p className="font-display text-2xl font-bold">Koniec gry</p>
          {winnerName && (
            <p className="text-sm text-muted-foreground">
              Wygrywa: {winnerName}
            </p>
          )}
        </Card>
      )}

      {!finished && !isMyTurn && (
        <Card className="mb-4 p-3 border-primary/30 bg-primary/10 text-center font-display text-primary">
          Teraz rzuca: {currentPlayerName}
        </Card>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <section className="relative overflow-visible space-y-4">
          <div className="relative z-10 lg:hidden">
            <RoomScorePanel game={game} />
          </div>

          <Dartboard
            onHit={handleHit}
            recentHits={recentHits}
            disabled={!isMyTurn || finished || busy}
          />

          <RoomTurnControls
            pendingDarts={game.pendingDarts}
            onUndo={handleUndo}
            disabled={busy || finished}
            canUndo={isMyTurn || recentHits.length === 0}
          />
        </section>

        <aside className="space-y-4">
          <div className="hidden lg:block">
            <RoomScorePanel game={game} />
          </div>

          <RoomHistoryPanel turns={history?.turns || []} />
        </aside>
      </div>

      <TurnSummaryOverlay turn={turnSummary} />
    </main>
  );
}