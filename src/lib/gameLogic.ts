import type { DartHit } from "./dartboard";

export type GameMode = 301 | 501;

export interface Player {
  id: string;
  name: string;
  score: number;        // pozostałe punkty
}

export interface TurnRecord {
  playerId: string;
  playerName: string;
  darts: DartHit[];     // do 3 rzutów
  totalScored: number;  // suma odjęta od wyniku (0 jeśli bust)
  bust: boolean;
  startScore: number;
  endScore: number;
}

export interface GameState {
  mode: GameMode;
  players: Player[];
  currentPlayerIdx: number;
  currentDarts: DartHit[];   // bieżąca tura, max 3
  history: TurnRecord[];     // zakończone tury
  winnerId: string | null;
  startedAt: number;
}

export const STORAGE_KEY = "dart-score-tracker:v1";

export function createGame(mode: GameMode, names: string[]): GameState {
  return {
    mode,
    players: names.map((n, i) => ({
      id: `${Date.now()}-${i}`,
      name: n.trim() || `Gracz ${i + 1}`,
      score: mode,
    })),
    currentPlayerIdx: 0,
    currentDarts: [],
    history: [],
    winnerId: null,
    startedAt: Date.now(),
  };
}

export function sumDarts(darts: DartHit[]): number {
  return darts.reduce((s, d) => s + d.score, 0);
}

/**
 * Próbuje zakończyć turę. Zwraca nowy stan + komunikat (bust/win/null).
 * MVP: straight out — wystarczy trafić dokładnie 0.
 */
export function endTurn(state: GameState): {
  state: GameState;
  event: "bust" | "win" | "next";
} {
  if (state.winnerId) return { state, event: "next" };
  const player = state.players[state.currentPlayerIdx];
  const darts = state.currentDarts;
  const total = sumDarts(darts);
  const tentative = player.score - total;

  let bust = false;
  let endScore = tentative;
  let event: "bust" | "win" | "next" = "next";

  if (tentative < 0 || tentative === 1) {
    // bust: zejście poniżej 0 lub do 1 (nie da się skończyć przy straight out z 1)
    // Uwaga: w straight out 1 NIE jest bustem klasycznie, ale też nie wygrywa.
    // Zostawiamy bust tylko dla < 0 zgodnie z wymaganiami "brak zejścia poniżej 0".
    if (tentative < 0) {
      bust = true;
      endScore = player.score;
      event = "bust";
    }
  }

  if (!bust && tentative === 0) {
    event = "win";
  }

  const record: TurnRecord = {
    playerId: player.id,
    playerName: player.name,
    darts,
    totalScored: bust ? 0 : total,
    bust,
    startScore: player.score,
    endScore,
  };

  const newPlayers = state.players.map((p, i) =>
    i === state.currentPlayerIdx ? { ...p, score: endScore } : p,
  );

  const winnerId = event === "win" ? player.id : null;
  const nextIdx = winnerId
    ? state.currentPlayerIdx
    : (state.currentPlayerIdx + 1) % state.players.length;

  return {
    state: {
      ...state,
      players: newPlayers,
      currentPlayerIdx: nextIdx,
      currentDarts: [],
      history: [...state.history, record],
      winnerId,
    },
    event,
  };
}

export function undoLastTurn(state: GameState): {
  state: GameState;
  undoneHit: DartHit | null;
} {
  // Jeśli są niezatwierdzone rzuty bieżącej tury — wycofaj ostatni rzut
  if (state.currentDarts.length > 0 && !state.winnerId) {
    const undoneHit = state.currentDarts[state.currentDarts.length - 1];

    return {
      state: {
        ...state,
        currentDarts: state.currentDarts.slice(0, -1),
      },
      undoneHit,
    };
  }

  // Inaczej cofnij ostatni rzut z ostatniej zakończonej tury
  if (state.history.length === 0) {
    return {
      state,
      undoneHit: null,
    };
  }

  const last = state.history[state.history.length - 1];
  const playerIdx = state.players.findIndex((p) => p.id === last.playerId);

  if (playerIdx < 0 || last.darts.length === 0) {
    return {
      state,
      undoneHit: null,
    };
  }

  const undoneHit = last.darts[last.darts.length - 1];
  const remainingDarts = last.darts.slice(0, -1);

  const remainingScore = remainingDarts.reduce(
    (sum, dart) => sum + dart.score,
    0
  );

  const restoredPlayers = state.players.map((p, i) =>
    i === playerIdx
      ? {
          ...p,
          score: last.startScore - remainingScore,
        }
      : p
  );

  return {
    state: {
      ...state,
      players: restoredPlayers,
      currentPlayerIdx: playerIdx,
      currentDarts: remainingDarts,
      history: state.history.slice(0, -1),
      winnerId: null,
    },
    undoneHit,
  };
}
