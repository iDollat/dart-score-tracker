import type { TurnRecord } from "@/lib/gameLogic";

interface Props {
  turn: TurnRecord | null;
}

export function TurnSummaryOverlay({ turn }: Props) {
  if (!turn) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="turn-summary-card w-full max-w-sm rounded-3xl border border-primary/40 bg-background/90 p-6 text-center shadow-glow backdrop-blur-md">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Koniec tury
        </p>

        <h2 className={`mt-3 font-display text-5xl font-black uppercase ${turn.bust ? "text-destructive" : "text-primary"}`}>
          {turn.bust ? "BUST" : turn.playerName}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {turn.bust ? "Tura anulowana" : `Zdobyte punkty: ${turn.totalScored}`}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => {
            const dart = turn.darts[i];

            return (
              <div key={i} className="rounded-2xl border border-border bg-card/80 p-3">
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
            {turn.startScore} → <span className="text-primary">{turn.endScore}</span>
          </p>
        </div>
      </div>
    </div>
  );
}