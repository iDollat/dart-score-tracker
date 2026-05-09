import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Loader2, RefreshCcw, Trophy } from "lucide-react";
import {
  closeRoom,
  restartRoomGame,
  saveRoomDart,
  undoRoomAction,
  leaveRoom,
  setRoomReady,
} from "@/api/roomsApi";
import { Dartboard } from "@/components/Dartboard";
import { RoomHistoryPanel } from "@/components/multiplayer/RoomHistoryPanel";
import { RoomScorePanel } from "@/components/multiplayer/RoomScorePanel";
import { RoomTurnControls } from "@/components/multiplayer/RoomTurnControls";
import { TurnSummaryOverlay } from "@/components/TurnSummaryOverlay";
import { WinDialog } from "@/components/WinDialog";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRoomPolling } from "@/hooks/useRoomPolling";
import { clearRoomSession, getRoomSession } from "@/lib/roomSession";
import {
  hitToRoomDart,
  pendingDartToHit,
  roomTurnDartToHit,
  roomTurnToTurnRecord,
} from "@/lib/roomDarts";
import type { DartHit } from "@/lib/dartboard";
import type { TurnRecord } from "@/lib/gameLogic";

const TURN_DARTS_PAUSE_MS = 1000;
const TURN_SUMMARY_MS = 2000;

export default function RoomGame() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const session = getRoomSession();
  const token = session?.clientToken || "";
  const roomCode = code || session?.roomCode || "";

  const { room, me, history, loading, error, closed, refetch } = useRoomPolling(
    {
      code: roomCode,
      token,
      includeHistory: true,
      intervalMs: 1200,
    },
  );

  type TurnTransition = {
    turnId: string;
    phase: "pause" | "summary";
    hits: DartHit[];
    playerName: string;
  };

  const [actionError, setActionError] = useState<string | null>(null);
  const [lastUndoLabel, setLastUndoLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingDartsCount, setSavingDartsCount] = useState(0);
  const [optimisticHits, setOptimisticHits] = useState<DartHit[]>([]);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [turnSummary, setTurnSummary] = useState<TurnRecord | null>(null);
  const [turnTransition, setTurnTransition] = useState<TurnTransition | null>(
    null,
  );

  const lastShownTurnIdRef = useRef<string | null>(null);
  const initializedHistoryRef = useRef(false);
  const transitionTimersRef = useRef<number[]>([]);
  const dartSaveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const game = room?.game || null;

  const controlledRoomPlayerIds = useMemo(
    () => me?.players.map((player) => player.id) || [],
    [me?.players],
  );

  const currentRoomPlayerId = game?.currentRoomPlayer?.id;
  const isSpectator = me?.client.role === "SPECTATOR";

  const isMyTurn =
    !isSpectator &&
    Boolean(
      currentRoomPlayerId &&
      controlledRoomPlayerIds.includes(currentRoomPlayerId),
    );

  const finished = room?.status === "FINISHED" || game?.status === "finished";
  const isHost = Boolean(me?.client.isHost) && !isSpectator;

  const playerClients =
    room?.clients?.filter((client) => client.role === "PLAYER") || [];

  const rematchVotingClients = playerClients.filter(
    (client) => client.id !== room?.hostClientId,
  );

  const readyForRematchCount = rematchVotingClients.filter(
    (client) => client.isReady,
  ).length;

  const totalPlayerClients = rematchVotingClients.length;

  const allPlayersReadyForRematch =
    totalPlayerClients === 0 || readyForRematchCount === totalPlayerClients;

  const meReadyForRematch = Boolean(me?.client.isReady);

  const rematchPlayers = playerClients.map((client) => ({
    id: client.id,
    isHost: client.id === room?.hostClientId,
    isReady: client.isReady,
    name:
      client.players?.map((roomPlayer) => roomPlayer.player.name).join(", ") ||
      client.name ||
      "Gracz",
  }));

  const serverHits = game?.pendingDarts.map(pendingDartToHit) || [];

  const recentHits = turnTransition
    ? turnTransition.hits
    : optimisticHits.length > 0
      ? [...serverHits, ...optimisticHits].slice(0, 3)
      : serverHits;

  const turnTransitionActive = Boolean(turnTransition);

  const visibleHitsCount = recentHits.length;

  const dartboardDisabled =
    isSpectator ||
    !isMyTurn ||
    finished ||
    turnTransitionActive ||
    visibleHitsCount >= 3;

  const currentPlayerName =
    turnTransition?.playerName || game?.currentRoomPlayer?.player?.name || "—";

  const winnerName = game?.scores.find(
    (score) =>
      score.playerId === game.winnerPlayerId || score.finalPosition === 1,
  )?.name;

  const currentTurnScore = recentHits.reduce((sum, hit) => sum + hit.score, 0);

const previewRemainingScore = (() => {
  if (!game?.currentRoomPlayer || currentTurnScore <= 0) {
    return null;
  }

  const currentPlayerScore = game.scores.find(
    (score) => score.playerId === game.currentRoomPlayer?.playerId,
  );

  if (!currentPlayerScore) {
    return null;
  }

  return currentPlayerScore.currentScore - currentTurnScore;
})();

const isPreviewBust =
  previewRemainingScore !== null &&
  (previewRemainingScore < 0 || previewRemainingScore === 1);

const scorePreviewGame = useMemo(() => {
  if (!game || !game.currentRoomPlayer || currentTurnScore <= 0) {
    return game;
  }

  return {
    ...game,
    scores: game.scores.map((score) => {
      if (score.playerId !== game.currentRoomPlayer?.playerId) {
        return score;
      }

      const nextScore = score.currentScore - currentTurnScore;

      return {
        ...score,

        /*
          Frontendowy podgląd:
          - normalny rzut pokazuje wynik po odjęciu,
          - BUST zostawia wynik bez zmian.
          
          Backend nadal powinien mieć właściwą logikę BUST jako źródło prawdy.
        */
        currentScore:
          nextScore < 0 || nextScore === 1 ? score.currentScore : nextScore,
      };
    }),
  };
}, [game, currentTurnScore]);

  useEffect(() => {
    if (!closed) return;

    clearRoomSession();
    navigate("/", { replace: true });
  }, [closed, navigate]);

  useEffect(() => {
    setOptimisticHits([]);
  }, [game?.pendingDarts.length, game?.currentRoomPlayer?.id]);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });

    transitionTimersRef.current = [];
  }, []);

  const startTurnTransition = useCallback(
    (turn: NonNullable<typeof history>["turns"][number]) => {
      clearTransitionTimers();

      const transitionHits = turn.darts.map(roomTurnDartToHit);
      const summary = roomTurnToTurnRecord(turn);

      setOptimisticHits([]);
      setTurnSummary(null);

      setTurnTransition({
        turnId: turn.id,
        phase: "pause",
        hits: transitionHits,
        playerName: turn.player.name,
      });

      const showSummaryTimer = window.setTimeout(() => {
        setTurnTransition((current) =>
          current?.turnId === turn.id
            ? {
                ...current,
                phase: "summary",
              }
            : current,
        );

        setTurnSummary(summary);
      }, TURN_DARTS_PAUSE_MS);

      const finishTransitionTimer = window.setTimeout(() => {
        setTurnSummary(null);
        setTurnTransition(null);
      }, TURN_DARTS_PAUSE_MS + TURN_SUMMARY_MS);

      transitionTimersRef.current = [showSummaryTimer, finishTransitionTimer];
    },
    [clearTransitionTimers],
  );

  useEffect(() => {
    const turns = history?.turns || [];

    if (!initializedHistoryRef.current) {
      initializedHistoryRef.current = true;

      if (turns.length > 0) {
        const lastTurn = turns[turns.length - 1];
        lastShownTurnIdRef.current = lastTurn.id;
      }

      return;
    }

    if (turns.length === 0) {
      lastShownTurnIdRef.current = null;
      return;
    }

    const lastTurn = turns[turns.length - 1];

    if (lastShownTurnIdRef.current === lastTurn.id) {
      return;
    }

    lastShownTurnIdRef.current = lastTurn.id;
    startTurnTransition(lastTurn);
  }, [history?.turns, startTurnTransition]);

  useEffect(() => {
    return () => {
      clearTransitionTimers();
    };
  }, [clearTransitionTimers]);

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

  const handleVoteRematch = async () => {
    if (busy || isSpectator) return;

    try {
      setBusy(true);
      setActionError(null);

      await setRoomReady(roomCode, token, true);
      await refetch("full");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Nie udało się zgłosić chęci rewanżu",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleHit = (hit: DartHit) => {
    if (
      !game?.currentRoomPlayer?.id ||
      isSpectator ||
      !isMyTurn ||
      finished ||
      turnTransitionActive ||
      recentHits.length >= 3
    ) {
      return;
    }

    const roomPlayerId = game.currentRoomPlayer.id;

    setActionError(null);
    setLastUndoLabel(null);
    setTurnSummary(null);

    // UI od razu pokazuje rzut.
    setOptimisticHits((prev) => [...prev, hit].slice(0, 3));

    setSavingDartsCount((count) => count + 1);

    // Backend zapisuje rzuty sekwencyjnie, w kolejności kliknięć.
    dartSaveQueueRef.current = dartSaveQueueRef.current
      .catch(() => {
        // Poprzedni błąd nie może zatrzymać całej kolejki.
      })
      .then(async () => {
        const response = await saveRoomDart(
          roomCode,
          token,
          hitToRoomDart(roomPlayerId, hit),
        );

        if (response.turnCompleted && response.turn) {
          lastShownTurnIdRef.current = response.turn.id;
          startTurnTransition(response.turn);
          return;
        }

        void refetch("full");
      })
      .catch((err) => {
        setOptimisticHits((prev) => {
          const next = [...prev];
          next.pop();
          return next;
        });

        setActionError(
          err instanceof Error ? err.message : "Nie udało się zapisać rzutu",
        );
      })
      .finally(() => {
        setSavingDartsCount((count) => Math.max(0, count - 1));
      });
  };

  const getLastUndoLabel = () => {
    const optimisticLastHit = optimisticHits.at(-1);

    if (optimisticLastHit?.label) {
      return optimisticLastHit.label;
    }

    const serverLastHit = serverHits.at(-1);

    if (serverLastHit?.label) {
      return serverLastHit.label;
    }

    const lastTurn = history?.turns.at(-1);
    const lastTurnDart = lastTurn?.darts.at(-1);

    if (lastTurnDart) {
      return roomTurnDartToHit(lastTurnDart).label;
    }

    return null;
  };

  const handleUndo = async () => {
    if (busy || finished || isSpectator) return;

    const undoLabel = getLastUndoLabel();

    try {
      setBusy(true);
      setActionError(null);

      await undoRoomAction(roomCode, token);

      setLastUndoLabel(undoLabel);

      setOptimisticHits((prev) => {
        if (prev.length === 0) return prev;

        const next = [...prev];
        next.pop();
        return next;
      });

      await refetch("history-only");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nie udało się cofnąć rzutu",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRestart = async () => {
    if (!game || busy) return;

    if (!isHost) {
      setActionError("Tylko host może rozpocząć rewanż.");
      return;
    }

    if (!allPlayersReadyForRematch) {
      setActionError("Nie wszyscy gracze zgłosili chęć rewanżu.");
      return;
    }

    try {
      setBusy(true);
      setActionError(null);
      setTurnSummary(null);
      setOptimisticHits([]);
      setLastUndoLabel(null);

      await restartRoomGame(roomCode, token, game.mode);

      initializedHistoryRef.current = false;
      lastShownTurnIdRef.current = null;

      await refetch("full");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nie udało się zrestartować gry",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCloseRoom = async () => {
    if (busy) return;

    if (!isHost) {
      setActionError("Tylko host może zakończyć pokój.");
      return;
    }

    try {
      setBusy(true);
      setActionError(null);

      await closeRoom(roomCode, token);

      clearRoomSession();
      navigate("/", { replace: true });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Nie udało się zakończyć pokoju",
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
          <p className="text-sm text-destructive-contrast">
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
    <main className="min-h-screen bg-background text-foreground p-3 sm:p-5 max-w-7xl mx-auto overflow-x-hidden [@media(min-width:1024px)_and_(min-height:1200px)]:h-screen [@media(min-width:1024px)_and_(min-height:1200px)]:overflow-hidden [@media(min-width:1024px)_and_(min-height:1200px)]:flex [@media(min-width:1024px)_and_(min-height:1200px)]:flex-col">
      <header className="flex items-center justify-between mb-4 gap-2 [@media(min-width:1024px)_and_(min-height:1200px)]:shrink-0">
        <div>
          <h1 className="font-display text-xl font-bold leading-none">
            Pokój <span className="text-primary">{room.code}</span> ·{" "}
            {game.mode}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            <RefreshCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Odśwież</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmLeaveOpen(true)}
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Wyjdź</span>
          </Button>
        </div>
      </header>

      {isSpectator && (
        <Card className="mb-4 p-3 border-primary/30 bg-primary/10 text-center font-display text-primary">
          <Eye className="w-5 h-5 mx-auto mb-1" />
          Oglądasz pokój jako widz
        </Card>
      )}

      {finished && (
        <Card className="mb-4 p-4 border-success bg-success/10 text-center">
          <Trophy className="w-8 h-8 mx-auto text-accent mb-2" />
          <p className="font-display text-2xl font-bold">Koniec gry</p>
          {winnerName && (
            <p className="text-sm text-muted-foreground">
              Wygrywa: {winnerName}
            </p>
          )}
          {(!isHost || isSpectator) && (
            <p className="text-xs text-muted-foreground mt-2">
              Rewanż albo zakończenie pokoju może uruchomić host.
            </p>
          )}
        </Card>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-contrast">
          {actionError}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4 [@media(min-width:1024px)_and_(min-height:1200px)]:min-h-0 [@media(min-width:1024px)_and_(min-height:1200px)]:flex-1">
        <section className="relative overflow-visible space-y-4 [@media(min-width:1024px)_and_(min-height:1200px)]:min-h-0 [@media(min-width:1024px)_and_(min-height:1200px)]:flex [@media(min-width:1024px)_and_(min-height:1200px)]:flex-col">
          <div className="relative z-10 lg:hidden">
            <RoomScorePanel game={scorePreviewGame || game} />
          </div>

          <div className="[@media(min-width:1024px)_and_(min-height:1200px)]:min-h-0 [@media(min-width:1024px)_and_(min-height:1200px)]:flex-1 [@media(min-width:1024px)_and_(min-height:1200px)]:flex [@media(min-width:1024px)_and_(min-height:1200px)]:items-center [@media(min-width:1024px)_and_(min-height:1200px)]:justify-center">
            <Dartboard
              onHit={handleHit}
              onUndo={handleUndo}
              recentHits={recentHits}
              disabled={dartboardDisabled}
            />
          </div>

          <RoomTurnControls
            pendingDarts={game.pendingDarts}
            onUndo={handleUndo}
            disabled={isSpectator || busy || finished}
            canUndo={!isSpectator && (isMyTurn || recentHits.length === 0)}
          />

          {lastUndoLabel && (
            <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-center font-display text-sm font-bold text-accent">
              Cofnięto: {lastUndoLabel}
            </div>
          )}
        </section>

        <aside className="space-y-4 [@media(min-width:1024px)_and_(min-height:1200px)]:min-h-0 [@media(min-width:1024px)_and_(min-height:1200px)]:overflow-hidden">
          <div className="hidden lg:block">
            <RoomScorePanel game={scorePreviewGame || game} />
          </div>

          <RoomHistoryPanel turns={history?.turns || []} />
        </aside>
      </div>

      <TurnSummaryOverlay turn={turnSummary} />

      {!isSpectator && (
        <WinDialog
          open={finished}
          winnerName={winnerName}
          onRestart={handleRestart}
          onQuit={isHost ? handleCloseRoom : handleLeave}
          onVoteRematch={handleVoteRematch}
          restartLabel="Rewanż"
          quitLabel="Zakończ grę"
          disabled={busy}
          mode="multiplayer"
          isHost={isHost}
          meReadyForRematch={meReadyForRematch}
          readyForRematchCount={readyForRematchCount}
          totalPlayerClients={totalPlayerClients}
          allPlayersReadyForRematch={allPlayersReadyForRematch}
          rematchPlayers={rematchPlayers}
        />
      )}
      <ConfirmModal
        open={confirmLeaveOpen}
        title="Opuścić grę?"
        description={
          isSpectator
            ? "Opuścisz pokój jako widz. Gra i gracze nie zostaną zmienieni."
            : isHost
              ? "Jesteś hostem pokoju. Jeśli są inni gracze, host zostanie przekazany kolejnej osobie. Jeśli jesteś ostatni, pokój zostanie zamknięty."
              : "Zostaniesz usunięty z gry razem z graczami kontrolowanymi przez tę przeglądarkę."
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
