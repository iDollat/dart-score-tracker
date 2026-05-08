import { useEffect, useState } from "react";
import type { TurnRecord } from "@/lib/gameLogic";

interface Props {
  turn: TurnRecord | null;
}

const EXIT_ANIMATION_MS = 250;

export function TurnSummaryOverlay({ turn }: Props) {
  const [displayedTurn, setDisplayedTurn] = useState<TurnRecord | null>(turn);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (turn) {
      setDisplayedTurn(turn);

      requestAnimationFrame(() => {
        setVisible(true);
      });

      return;
    }

    setVisible(false);

    const timeoutId = window.setTimeout(() => {
      setDisplayedTurn(null);
    }, EXIT_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [turn]);

  if (!displayedTurn) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[200] flex items-center justify-center px-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`turn-summary-card w-full max-w-sm rounded-3xl border border-primary/40 bg-background/90 p-6 text-center shadow-glow backdrop-blur-md transition-all duration-300 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Koniec tury
        </p>

        <h2
          className={`mt-3 font-display text-5xl font-black uppercase ${
            displayedTurn.bust ? "text-destructive" : "text-primary"
          }`}
        >
          {displayedTurn.bust ? "BUST" : displayedTurn.playerName}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {displayedTurn.bust
            ? "Tura anulowana"
            : `Zdobyte punkty: ${displayedTurn.totalScored}`}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => {
            const dart = displayedTurn.darts[i];

            return (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card/80 p-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Rzut {i + 1}
                </p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {dart ? dart.label : "—"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl bg-secondary/70 p-3">
          <p className="text-xs text-muted-foreground">Wynik gracza</p>
          <p className="font-display text-3xl font-bold">
            {displayedTurn.startScore} →{" "}
            <span className="text-primary">{displayedTurn.endScore}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
