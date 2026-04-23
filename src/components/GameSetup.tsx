import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Play, Target } from "lucide-react";
import type { GameMode } from "@/lib/gameLogic";

interface Props {
  onStart: (mode: GameMode, names: string[]) => void;
}

export function GameSetup({ onStart }: Props) {
  const [mode, setMode] = useState<GameMode>(501);
  const [names, setNames] = useState<string[]>(["Gracz 1", "Gracz 2"]);

  const updateName = (i: number, v: string) =>
    setNames((arr) => arr.map((n, idx) => (idx === i ? v : n)));
  const addPlayer = () => setNames((arr) => (arr.length < 8 ? [...arr, `Gracz ${arr.length + 1}`] : arr));
  const removePlayer = (i: number) =>
    setNames((arr) => (arr.length > 2 ? arr.filter((_, idx) => idx !== i) : arr));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-6 sm:p-8 shadow-card-elev border-border/60 bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Target className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold leading-none">DART<span className="text-primary">501</span></h1>
            <p className="text-sm text-muted-foreground">Score Tracker</p>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground mb-2">Tryb gry</h2>
          <div className="grid grid-cols-2 gap-3">
            {[301, 501].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as GameMode)}
                className={`py-6 rounded-xl border-2 font-display text-3xl font-bold transition-all ${
                  mode === m
                    ? "border-primary bg-primary/10 text-primary shadow-glow"
                    : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display uppercase text-sm tracking-wider text-muted-foreground">
              Gracze ({names.length}/8)
            </h2>
            <Button size="sm" variant="secondary" onClick={addPlayer} disabled={names.length >= 8}>
              <Plus className="w-4 h-4 mr-1" /> Dodaj
            </Button>
          </div>
          <div className="space-y-2">
            {names.map((n, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center font-display text-primary">
                  {i + 1}
                </div>
                <Input
                  value={n}
                  onChange={(e) => updateName(i, e.target.value)}
                  maxLength={20}
                  className="bg-secondary/50"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removePlayer(i)}
                  disabled={names.length <= 2}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <Button
          size="lg"
          className="w-full font-display text-lg uppercase tracking-wide bg-gradient-primary hover:opacity-90 shadow-glow"
          onClick={() => onStart(mode, names)}
        >
          <Play className="w-5 h-5 mr-2" /> Rozpocznij grę
        </Button>
      </Card>
    </div>
  );
}
