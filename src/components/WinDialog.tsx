import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home } from "lucide-react";

interface Props {
  open: boolean;
  winnerName: string | undefined;
  onRestart: () => void;
  onQuit: () => void;
}

export function WinDialog({ open, winnerName, onRestart, onQuit }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="border-success/40">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow mb-2">
            <Trophy className="w-9 h-9 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-display text-3xl">
            Zwycięstwo!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            <span className="font-bold text-foreground">{winnerName}</span> kończy partię.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={onQuit}>
            <Home className="w-4 h-4 mr-2" /> Nowa konfiguracja
          </Button>
          <Button onClick={onRestart} className="bg-gradient-primary">
            <RotateCcw className="w-4 h-4 mr-2" /> Rewanż
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
