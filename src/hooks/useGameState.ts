import { useCallback, useEffect, useState } from "react";
import {
  GameState,
  STORAGE_KEY,
  GameMode,
  TurnRecord,
  createGame,
  endTurn,
  undoLastTurn,
} from "@/lib/gameLogic";
import type { DartHit } from "@/lib/dartboard";
import { toast } from "sonner";

export function useGameState() {
  const [turnSummary, setTurnSummary] = useState<TurnRecord | null>(null);
  useEffect(() => {
    if (!turnSummary) return;

    const timeout = window.setTimeout(() => {
      setTurnSummary(null);
    }, 3800);

    return () => window.clearTimeout(timeout);
  }, [turnSummary]);

  const [state, setState] = useState<GameState | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as GameState;
    } catch {}
    return null;
  });

  useEffect(() => {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const newGame = useCallback((mode: GameMode, names: string[]) => {
    setState(createGame(mode, names));
  }, []);

  const restartGame = useCallback(() => {
    setState((s) =>
      s
        ? createGame(
            s.mode,
            s.players.map((p) => p.name),
          )
        : s,
    );
  }, []);

  const quitGame = useCallback(() => setState(null), []);

  const addDart = useCallback((hit: DartHit) => {
    setState((s) => {
      if (!s || s.winnerId) return s;
      if (s.currentDarts.length >= 3) return s;
      const next = { ...s, currentDarts: [...s.currentDarts, hit] };
      // auto-end po 3 rzutach
      if (next.currentDarts.length === 3) {
        const result = endTurn(next);
        const lastTurn =
          result.state.history[result.state.history.length - 1] ?? null;
        setTurnSummary(lastTurn);
        announce(result.event, result.state);
        return result.state;
      }
      // wczesny bust / win po dowolnym rzucie
      const player = next.players[next.currentPlayerIdx];
      const total = next.currentDarts.reduce((a, d) => a + d.score, 0);
      const remaining = player.score - total;

      if (remaining < 0 || remaining === 1 || remaining === 0) {
        const result = endTurn(next);
        const lastTurn =
          result.state.history[result.state.history.length - 1] ?? null;

        setTurnSummary(lastTurn);
        announce(result.event, result.state);

        return result.state;
      }
      return next;
    });
  }, []);

  const finishTurn = useCallback(() => {
    setState((s) => {
      if (!s || s.winnerId) return s;
      const result = endTurn(s);
      const lastTurn =
        result.state.history[result.state.history.length - 1] ?? null;
      setTurnSummary(lastTurn);
      announce(result.event, result.state);
      return result.state;
    });
  }, []);

  const [lastUndoLabel, setLastUndoLabel] = useState<string | null>(null);

  const undo = () => {
    setState((s) => {
      const result = undoLastTurn(s);

      if (result.undoneHit) {
        setLastUndoLabel(result.undoneHit.label ?? `${result.undoneHit.score}`);
      }

      return result.state;
    });
  };

  useEffect(() => {
    if (!lastUndoLabel) return;

    const timeout = window.setTimeout(() => {
      setLastUndoLabel(null);
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, [lastUndoLabel]);

  return {
    state,
    turnSummary,
    lastUndoLabel,
    newGame,
    restartGame,
    quitGame,
    addDart,
    finishTurn,
    undo,
  };
}

function announce(event: "bust" | "win" | "next", state: GameState) {
  if (event === "bust") {
    const last = state.history[state.history.length - 1];
    toast.error("BUST!", {
      description: `${last.playerName} — tura cofnięta.`,
    });
  } else if (event === "win") {
    const winner = state.players.find((p) => p.id === state.winnerId);
    toast.success("Zwycięstwo!", {
      description: `${winner?.name} wygrywa partię 🎯`,
    });
  }
}
