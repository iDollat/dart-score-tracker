import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Play, Target } from "lucide-react";
import type { GameMode } from "@/lib/gameLogic";

interface Props {
  onStart: (mode: GameMode, names: string[]) => void;
  initialMode?: GameMode;
  initialNames?: string[];
}

function normalizeInitialNames(names: string[] | undefined) {
  if (!names || names.length === 0) {
    return ["Gracz 1", "Gracz 2"];
  }

  return names.slice(0, 8).map((name, index) => {
    const trimmedName = name.trim();

    return trimmedName.length > 0 ? trimmedName : `Gracz ${index + 1}`;
  });
}

export function GameSetup({ onStart, initialMode = 501, initialNames }: Props) {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [names, setNames] = useState<string[]>(
    normalizeInitialNames(initialNames),
  );

  useEffect(() => {
    setMode(initialMode);
    setNames(normalizeInitialNames(initialNames));
  }, [initialMode, initialNames]);

  const updateName = (i: number, v: string) =>
    setNames((arr) => arr.map((n, idx) => (idx === i ? v : n)));

  const addPlayer = () =>
    setNames((arr) =>
      arr.length < 8 ? [...arr, `Gracz ${arr.length + 1}`] : arr,
    );

  const removePlayer = (i: number) =>
    setNames((arr) =>
      arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr,
    );

  const handleStart = () => {
    const finalNames = names.map((name, index) => {
      const trimmedName = name.trim();

      return trimmedName.length > 0 ? trimmedName : `Gracz ${index + 1}`;
    });

    onStart(mode, finalNames);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-6 sm:p-8 shadow-card-elev border-border/60 bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Target className="w-7 h-7 text-primary-foreground" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold leading-none">
              DART<span className="text-primary">501</span>
            </h1>
            <p className="text-sm text-muted-foreground">Score Tracker</p>
          </div>
        </div>

        <section className="mb-6">
          <h2
            id="game-mode-heading"
            className="font-display uppercase text-sm tracking-wider text-muted-foreground mb-2"
          >
            Tryb gry
          </h2>

          <div
            className="grid grid-cols-2 gap-3"
            role="group"
            aria-labelledby="game-mode-heading"
          >
            {[301, 501].map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m as GameMode)}
                className={`focus-ring py-6 rounded-xl border-2 font-display text-3xl font-bold transition-all ${
                  mode === m
                    ? "border-primary bg-primary/10 text-primary-contrast shadow-glow"
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

            <Button
              size="sm"
              variant="secondary"
              onClick={addPlayer}
              disabled={names.length >= 8}
            >
              <Plus className="w-4 h-4 mr-1" />
              Dodaj
            </Button>
          </div>

          <div className="space-y-2">
            {names.map((n, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center font-display text-primary">
                  {i + 1}
                </div>

                <label htmlFor={`player-name-${i}`} className="sr-only">
                  Nazwa gracza {i + 1}
                </label>

                <Input
                  id={`player-name-${i}`}
                  value={n}
                  onChange={(e) => updateName(i, e.target.value)}
                  maxLength={20}
                  className="bg-secondary/50"
                />

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Usuń gracza ${i + 1}`}
                  onClick={() => removePlayer(i)}
                  disabled={names.length <= 1}
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
          onClick={handleStart}
        >
          <Play className="w-5 h-5 mr-2" />
          Rozpocznij grę
        </Button>
      </Card>
    </div>
  );
}
