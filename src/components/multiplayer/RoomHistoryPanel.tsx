import type { RoomTurnDto } from "@/api/roomsApi";
import { Card } from "@/components/ui/card";

interface RoomHistoryPanelProps {
  turns: RoomTurnDto[];
}

export function RoomHistoryPanel({ turns }: RoomHistoryPanelProps) {
  return (
    <Card className="p-4 bg-card/80 border-border/70">
      <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground mb-3">
        Historia tur
      </h2>

      {turns.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak zakończonych tur.</p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {[...turns].reverse().map((turn) => (
            <div key={turn.id} className="rounded-xl border border-border bg-secondary/25 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-display font-bold">
                    #{turn.turnNumber} {turn.player.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {turn.startScore} → {turn.endScore}
                    {turn.bust && " · BUST"}
                  </div>
                </div>

                <div className="font-display text-xl font-bold">
                  {turn.scored}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {turn.darts.map((dart) => (
                  <span
                    key={`${turn.id}-${dart.dartIndex}`}
                    className="rounded-full bg-background/70 border px-2 py-0.5 text-xs"
                  >
                    {dart.multiplier === 3
                      ? `T${dart.segment}`
                      : dart.multiplier === 2
                        ? `D${dart.segment}`
                        : dart.segment === 25 && dart.score === 50
                          ? "50"
                          : dart.segment === 25
                            ? "BULL"
                            : dart.score === 0
                              ? "MISS"
                              : String(dart.segment)}
                    {" "}
                    ({dart.score})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}