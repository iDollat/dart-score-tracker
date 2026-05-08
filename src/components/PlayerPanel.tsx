import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import type { Player } from "@/lib/gameLogic";
import type { DartHit } from "@/lib/dartboard";

interface Props {
  players: Player[];
  currentIdx: number;
  winnerId: string | null;
  currentDarts: DartHit[];
}

export function PlayerPanel({ players, currentIdx, winnerId, currentDarts }: Props) {
  const turnTotal = currentDarts.reduce((s, d) => s + d.score, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
      {players.map((p, i) => {
        const active = i === currentIdx && !winnerId;
        const isWinner = p.id === winnerId;
        const projected = active ? Math.max(0, p.score - turnTotal) : p.score;
        return (
          <Card
            key={p.id}
            className={`p-3 transition-all border-2 ${
              active
                ? "border-primary bg-primary/5 shadow-glow animate-pulse-glow"
                : isWinner
                ? "border-success bg-success/10"
                : "border-border bg-card/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-sm uppercase tracking-wide truncate flex items-center gap-1">
                {isWinner && <Crown className="w-4 h-4 text-accent" />}
                {p.name}
              </span>
              {active && (
                <span className="text-[10px] font-display uppercase text-accent">na tarczy</span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`font-display text-4xl font-bold leading-none ${
                  active ? "text-primary" : isWinner ? "text-success" : "text-foreground"
                }`}
              >
                {projected}
              </span>
              {active && turnTotal > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({p.score} − {turnTotal})
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
