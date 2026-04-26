import type { GameDto } from "@/api/roomsApi";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RoomScorePanelProps {
  game: GameDto;
}

export function RoomScorePanel({ game }: RoomScorePanelProps) {
  const currentPlayerId = game.currentRoomPlayer?.playerId || game.currentRoomPlayer?.player?.id;

  return (
    <Card className="p-4 bg-card/80 border-border/70">
      <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground mb-3">
        Wyniki
      </h2>

      <div className="grid gap-2">
        {game.scores.map((score) => {
          const active = score.playerId === currentPlayerId;

          return (
            <div
              key={score.playerId}
              className={cn(
                "rounded-xl border px-4 py-3 flex items-center justify-between",
                active
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-secondary/30",
              )}
            >
              <div>
                <div className="font-display font-bold">
                  {score.name}
                  {active && <span className="text-primary"> — teraz</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  Start: {score.startingScore}
                  {score.finalPosition && ` · Pozycja: ${score.finalPosition}`}
                </div>
              </div>

              <div className="font-display text-3xl font-bold tabular-nums">
                {score.currentScore}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}