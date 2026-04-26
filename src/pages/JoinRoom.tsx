import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DoorOpen, Loader2 } from "lucide-react";
import { joinRoom } from "@/api/roomsApi";
import { PlayerPicker } from "@/components/multiplayer/PlayerPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveRoomSession } from "@/lib/roomSession";

export default function JoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = async () => {
    const code = roomCode.trim().toUpperCase();

    if (!code) {
      setError("Wpisz kod pokoju.");
      return;
    }

    if (selectedPlayerIds.length === 0) {
      setError("Wybierz przynajmniej jednego gracza.");
      return;
    }

    try {
      setJoining(true);
      setError(null);
      const response = await joinRoom(code, selectedPlayerIds);

      saveRoomSession({
        roomCode: response.room.code,
        clientToken: response.clientToken,
        clientId: response.client.id,
      });

      navigate(`/rooms/${response.room.code}/lobby`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się dołączyć do pokoju");
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate("/")}> 
          <ArrowLeft className="w-4 h-4 mr-2" /> Wróć
        </Button>

        <Card className="p-5 sm:p-6 bg-card/80 border-border/70 space-y-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Dołącz do pokoju</h1>
            <p className="text-sm text-muted-foreground">
              Wpisz kod pokoju i wybierz graczy, których będzie kontrolować ta przeglądarka.
            </p>
          </div>
          <Input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            placeholder="ABC12"
            maxLength={8}
            className="bg-secondary/50 font-display text-2xl tracking-widest uppercase text-center h-14"
          />
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
          onClick={handleJoinRoom}
          disabled={joining || selectedPlayerIds.length === 0 || !roomCode.trim()}
        >
          {joining ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <DoorOpen className="w-5 h-5 mr-2" />}
          Dołącz
        </Button>
      </div>
    </main>
  );
}