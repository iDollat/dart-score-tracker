import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";
import { createRoom } from "@/api/roomsApi";
import { PlayerPicker } from "@/components/multiplayer/PlayerPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveRoomSession } from "@/lib/roomSession";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (selectedPlayerIds.length === 0) {
      setError("Wybierz przynajmniej jednego gracza.");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const response = await createRoom(selectedPlayerIds);

      saveRoomSession({
        roomCode: response.room.code,
        clientToken: response.clientToken,
        clientId: response.client.id,
      });

      navigate(`/rooms/${response.room.code}/lobby`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się stworzyć pokoju");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate("/")}> 
          <ArrowLeft className="w-4 h-4 mr-2" /> Wróć
        </Button>

        <Card className="p-5 sm:p-6 bg-card/80 border-border/70">
          <h1 className="font-display text-3xl font-bold mb-2">Stwórz pokój</h1>
          <p className="text-sm text-muted-foreground">
            Wybierz graczy kontrolowanych przez tę przeglądarkę. Backend zwróci kod pokoju i token klienta.
          </p>
        </Card>

        <PlayerPicker selectedPlayerIds={selectedPlayerIds} onChange={setSelectedPlayerIds} />

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full font-display text-lg uppercase tracking-wide bg-gradient-primary shadow-glow"
          onClick={handleCreateRoom}
          disabled={creating || selectedPlayerIds.length === 0}
        >
          {creating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <PlusCircle className="w-5 h-5 mr-2" />}
          Stwórz pokój
        </Button>
      </div>
    </main>
  );
}