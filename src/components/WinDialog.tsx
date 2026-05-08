import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  RotateCcw,
  Home,
  CheckCircle2,
  DoorOpen,
  Crown,
} from "lucide-react";

type RematchPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
};

interface Props {
  open: boolean;
  winnerName: string | undefined;
  onRestart: () => void;
  onQuit: () => void;
  restartLabel?: string;
  quitLabel?: string;
  disabled?: boolean;

  mode?: "local" | "multiplayer";
  isHost?: boolean;
  onVoteRematch?: () => void;
  meReadyForRematch?: boolean;
  readyForRematchCount?: number;
  totalPlayerClients?: number;
  allPlayersReadyForRematch?: boolean;
  rematchPlayers?: RematchPlayer[];
}

export function WinDialog({
  open,
  winnerName,
  onRestart,
  onQuit,
  restartLabel = "Rewanż",
  quitLabel = "Nowa konfiguracja",
  disabled = false,

  mode = "local",
  isHost = false,
  onVoteRematch,
  meReadyForRematch = false,
  readyForRematchCount = 0,
  totalPlayerClients = 0,
  allPlayersReadyForRematch = false,
  rematchPlayers = [],
}: Props) {
  const isMultiplayer = mode === "multiplayer";

  return (
    <Dialog open={open}>
      <DialogContent className="border-success/40 [&>button]:hidden">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow mb-2">
            <Trophy className="w-9 h-9 text-primary-foreground" />
          </div>

          <DialogTitle className="text-center font-display text-3xl">
            Zwycięstwo!
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            <span className="font-bold text-foreground">
              {winnerName || "Gracz"}
            </span>{" "}
            kończy partię.
          </DialogDescription>

          {isMultiplayer && (
            <div className="mt-4 rounded-2xl border border-border bg-card/70 p-3">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Rewanż
                </p>

                <p className="mt-1 font-display text-l font-bold">
                  {readyForRematchCount}/{totalPlayerClients} graczy gotowych
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {rematchPlayers.map((player) => {
                  const readyLabel = player.isHost
                    ? "Host"
                    : player.isReady
                      ? "Chcę zagrać ponownie"
                      : "Czeka";

                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-display text-base font-bold">
                            {player.name}
                          </p>

                          {player.isHost && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                              <Crown className="h-3 w-3" />
                              Host
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          player.isReady
                            ? "bg-success/15 text-success"
                            : player.isHost
                              ? "bg-primary/15 text-primary"
                              : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {readyLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isHost ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Możesz rozpocząć rewanż, gdy gracze zgłoszą chęć gry.
                </p>
              ) : meReadyForRematch ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Zgłoszono chęć rewanżu. Czekasz na hosta.
                </p>
              ) : (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Zgłoś chęć rewanżu albo opuść pokój.
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        {!isMultiplayer && (
          <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={onQuit} disabled={disabled}>
              <Home className="w-4 h-4 mr-2" />
              {quitLabel}
            </Button>

            <Button
              onClick={onRestart}
              className="bg-gradient-primary"
              disabled={disabled}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {restartLabel}
            </Button>
          </DialogFooter>
        )}

        {isMultiplayer && isHost && (
          <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={onQuit} disabled={disabled}>
              <Home className="w-4 h-4 mr-2" />
              Zakończ grę
            </Button>

            <Button
              onClick={onRestart}
              className="bg-gradient-primary"
              disabled={disabled || !allPlayersReadyForRematch}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Rozpocznij rewanż
            </Button>
          </DialogFooter>
        )}

        {isMultiplayer && !isHost && (
          <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={onQuit} disabled={disabled}>
              <DoorOpen className="w-4 h-4 mr-2" />
              Opuść pokój
            </Button>

            <Button
              onClick={onVoteRematch}
              className="bg-gradient-primary"
              disabled={disabled || meReadyForRematch}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {meReadyForRematch ? "Zgłoszono" : "Chcę zagrać ponownie"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
