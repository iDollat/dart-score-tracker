import { useCallback, useEffect, useState } from "react";
import { GameState, STORAGE_KEY, GameMode, createGame, endTurn, undoLastTurn } from "@/lib/gameLogic";
import type { DartHit } from "@/lib/dartboard";
import { toast } from "sonner";

export function useGameState() {
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
    setState((s) => (s ? createGame(s.mode, s.players.map((p) => p.name)) : s));
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
        announce(result.event, result.state);
        return result.state;
      }
      // wczesny bust po dowolnym rzucie? Sprawdźmy potencjalny score.
      const player = next.players[next.currentPlayerIdx];
      const total = next.currentDarts.reduce((a, d) => a + d.score, 0);
      if (player.score - total < 0) {
        const result = endTurn(next);
        announce(result.event, result.state);
        return result.state;
      }
      if (player.score - total === 0) {
        const result = endTurn(next);
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
      announce(result.event, result.state);
      return result.state;
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) => (s ? undoLastTurn(s) : s));
  }, []);

  return { state, newGame, restartGame, quitGame, addDart, finishTurn, undo };
}

function announce(event: "bust" | "win" | "next", state: GameState) {
  if (event === "bust") {
    const last = state.history[state.history.length - 1];
    toast.error("BUST!", { description: `${last.playerName} — tura cofnięta.` });
  } else if (event === "win") {
    const winner = state.players.find((p) => p.id === state.winnerId);
    toast.success("Zwycięstwo!", { description: `${winner?.name} wygrywa partię 🎯` });
  }
}
