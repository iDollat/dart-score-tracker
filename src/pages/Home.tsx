import { useNavigate } from "react-router-dom";
import {
  DoorOpen,
  LogIn,
  MonitorPlay,
  PlusCircle,
  Target,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRoomSession } from "@/lib/roomSession";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/auth/UserMenu";

export default function Home() {
  const navigate = useNavigate();
  const session = getRoomSession();
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div
        className="fixed right-4 top-4 z-[200] flex items-center gap-2"
        aria-live="polite"
      >
        {loading ? (
          <div
            className="h-9 w-32 animate-pulse rounded-md bg-muted"
            role="status"
            aria-label="Ładowanie informacji o użytkowniku"
          />
        ) : user ? (
          <UserMenu />
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
              Zaloguj
            </Button>

            <Button size="sm" onClick={() => navigate("/register")}>
              <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              Rejestracja
            </Button>
          </>
        )}
      </div>

      <Card className="w-full max-w-xl p-6 sm:p-8 shadow-card-elev border-border/60 bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Target className="w-7 h-7 text-primary-foreground" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold leading-none">
              DART<span className="text-primary">ONLINE</span>
            </h1>

            <p className="text-sm text-muted-foreground">
              {user
                ? `Witaj, ${user.displayName}`
                : "Lokalnie albo multiplayer przez pokoje"}
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <Button
            size="lg"
            className="justify-start font-display text-lg"
            onClick={() => navigate("/local")}
          >
            <MonitorPlay className="w-5 h-5 mr-3" />
            Gra lokalna
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="justify-start font-display text-lg"
            onClick={() => navigate("/rooms/create")}
          >
            <PlusCircle className="w-5 h-5 mr-3" />
            Stwórz pokój
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="justify-start font-display text-lg"
            onClick={() => navigate("/rooms/join")}
          >
            <DoorOpen className="w-5 h-5 mr-3" />
            Dołącz do pokoju
          </Button>
        </div>

        {session && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
            <p className="font-medium">
              Masz zapisaną sesję pokoju {session.roomCode}.
            </p>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => navigate(`/rooms/${session.roomCode}/lobby`)}
              >
                Wróć do lobby
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/rooms/${session.roomCode}/game`)}
              >
                Wróć do gry
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
