import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Undo2, SkipForward, Pencil } from "lucide-react";
import { useState } from "react";
import type { DartHit } from "@/lib/dartboard";
import { Input } from "@/components/ui/input";

interface Props {
  currentDarts: DartHit[];
  onUndo: () => void;
  onFinishTurn: () => void;
  onManualAdd: (hit: DartHit) => void;
  disabled?: boolean;
}

export function TurnControls({ currentDarts, onUndo, onFinishTurn, onManualAdd, disabled }: Props) {
  const [manual, setManual] = useState("");

  const submitManual = () => {
    const v = parseInt(manual, 10);
    if (!isNaN(v) && v >= 0 && v <= 60) {
      onManualAdd({
        sector: 0,
        ring: "SINGLE",
        score: v,
        label: `${v} (ręcznie)`,
        x: 200,
        y: 200,
      });
      setManual("");
    }
  };

  return (
    <Card className="p-3 bg-card/60 border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display uppercase text-xs tracking-wider text-muted-foreground">
          Bieżąca tura
        </span>
        <span className="font-display text-sm">
          Suma: <span className="text-primary font-bold">{currentDarts.reduce((s, d) => s + d.score, 0)}</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[0, 1, 2].map((i) => {
          const d = currentDarts[i];
          return (
            <div
              key={i}
              className={`h-14 rounded-lg border-2 flex items-center justify-center font-display text-lg ${
                d ? "border-primary bg-primary/10 text-primary" : "border-dashed border-border text-muted-foreground"
              }`}
            >
              {d ? d.label : `Rzut ${i + 1}`}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex gap-2">
          <Input
            inputMode="numeric"
            placeholder="Punkty ręcznie (0-60)"
            value={manual}
            onChange={(e) => setManual(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submitManual()}
            disabled={disabled || currentDarts.length >= 3}
            className="bg-secondary/50"
          />
          <Button onClick={submitManual} variant="secondary" disabled={disabled || currentDarts.length >= 3}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onUndo} disabled={disabled}>
          <Undo2 className="w-4 h-4 mr-2" /> Cofnij
        </Button>
        <Button
          onClick={onFinishTurn}
          disabled={disabled || currentDarts.length === 0}
          className="bg-gradient-primary"
        >
          <SkipForward className="w-4 h-4 mr-2" /> Zakończ turę
        </Button>
      </div>
    </Card>
  );
}
