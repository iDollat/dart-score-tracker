import { RotateCcw } from "lucide-react";
import type { PendingDartDto } from "@/api/roomsApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pendingDartLabel } from "@/lib/roomDarts";

interface RoomTurnControlsProps {
  pendingDarts: PendingDartDto[];
  onUndo: () => void;
  disabled?: boolean;
  canUndo?: boolean;
}

export function RoomTurnControls({
  pendingDarts,
  onUndo,
  disabled = false,
  canUndo = true,
}: RoomTurnControlsProps) {
  const pendingSum = pendingDarts.reduce((sum, dart) => sum + dart.score, 0);

  return (
    <Card className="p-4 bg-card/80 border-border/70">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground">
            Aktualna tura
          </h2>
          <p className="text-sm text-muted-foreground">
            Backend kończy turę automatycznie po 3 rzutach.
          </p>
        </div>

        <div className="font-display text-3xl font-bold">
          {pendingSum}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0, 1, 2].map((index) => {
          const dart = pendingDarts[index];

          return (
            <div
              key={index}
              className="rounded-xl border border-border bg-secondary/30 p-3 text-center min-h-[74px] flex flex-col justify-center"
            >
              <div className="text-xs text-muted-foreground">Rzut {index + 1}</div>
              {dart ? (
                <>
                  <div className="font-display text-xl font-bold">
                    {pendingDartLabel(dart.segment, dart.multiplier, dart.score)}
                  </div>
                  <div className="text-xs text-muted-foreground">{dart.score} pkt</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={onUndo}
        disabled={disabled || !canUndo}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Cofnij
      </Button>
    </Card>
  );
}