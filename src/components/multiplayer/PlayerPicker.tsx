import { useEffect, useState } from "react";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { createPlayer, getPlayers, type PlayerDto } from "@/api/roomsApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PlayerPickerProps {
  selectedPlayerIds: string[];
  onChange: (ids: string[]) => void;
}

export function PlayerPicker({ selectedPlayerIds, onChange }: PlayerPickerProps) {
  const [players, setPlayers] = useState<PlayerDto[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlayers();
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać graczy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlayers();
  }, []);

  const togglePlayer = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onChange(selectedPlayerIds.filter((id) => id !== playerId));
    } else {
      onChange([...selectedPlayerIds, playerId]);
    }
  };

  const handleCreatePlayer = async () => {
    const name = newPlayerName.trim();

    if (!name) return;

    try {
      setCreating(true);
      setError(null);

      const created = await createPlayer(name);

      setPlayers((prev) => [...prev, created]);
      onChange([...selectedPlayerIds, created.id]);
      setNewPlayerName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się dodać gracza");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="p-5 bg-card/80 border-border/70 space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Wybierz graczy</h2>
        <p className="text-sm text-muted-foreground">
          Możesz zaznaczyć kilku graczy dla jednej przeglądarki.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Ładowanie graczy...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-2">
        {players.map((player) => {
          const selected = selectedPlayerIds.includes(player.id);

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => togglePlayer(player.id)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-all",
                selected
                  ? "border-primary bg-primary/10 text-primary shadow-glow"
                  : "border-border bg-secondary/30 hover:bg-secondary/60",
              )}
            >
              <div className="font-display font-bold">{player.name}</div>
              <div className="text-xs text-muted-foreground">
                {selected ? "Wybrany" : "Kliknij, aby wybrać"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={newPlayerName}
          onChange={(event) => setNewPlayerName(event.target.value)}
          placeholder="Nowy gracz"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void handleCreatePlayer();
            }
          }}
        />
        <Button onClick={handleCreatePlayer} disabled={creating || !newPlayerName.trim()}>
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          <span className="hidden sm:inline ml-2">Dodaj</span>
          <span className="sm:hidden ml-2">
            <Plus className="w-4 h-4" />
          </span>
        </Button>
      </div>
    </Card>
  );
}