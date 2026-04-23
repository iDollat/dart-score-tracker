import { useGameState } from "@/hooks/useGameState";
import { GameSetup } from "@/components/GameSetup";
import { Dartboard } from "@/components/Dartboard";
import { PlayerPanel } from "@/components/PlayerPanel";
import { TurnControls } from "@/components/TurnControls";
import { HistoryPanel } from "@/components/HistoryPanel";
import { WinDialog } from "@/components/WinDialog";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw, Target } from "lucide-react";

const Index = () => {
  const { state, newGame, restartGame, quitGame, addDart, finishTurn, undo } = useGameState();

  if (!state) {
    return (
      <main>
        <h1 className="sr-only">Dart Score Tracker — interaktywna tarcza do darta 301 i 501</h1>
        <GameSetup onStart={newGame} />
      </main>
    );
  }

  const winner = state.players.find((p) => p.id === state.winnerId);

  return (
    <main className="min-h-screen p-3 sm:p-5 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-none">
              DART<span className="text-primary">{state.mode}</span>
            </h1>
            <p className="text-xs text-muted-foreground">{state.players.length} graczy</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={restartGame}>
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Restart</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={quitGame}>
            <Home className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nowa gra</span>
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <section className="space-y-4">
          <div className="lg:hidden">
            <PlayerPanel
              players={state.players}
              currentIdx={state.currentPlayerIdx}
              winnerId={state.winnerId}
              currentDarts={state.currentDarts}
            />
          </div>

          <Dartboard
            onHit={addDart}
            recentHits={state.currentDarts}
            disabled={!!state.winnerId}
          />

          <TurnControls
            currentDarts={state.currentDarts}
            onUndo={undo}
            onFinishTurn={finishTurn}
            onManualAdd={addDart}
            disabled={!!state.winnerId}
          />
        </section>

        <aside className="space-y-4">
          <div className="hidden lg:block">
            <PlayerPanel
              players={state.players}
              currentIdx={state.currentPlayerIdx}
              winnerId={state.winnerId}
              currentDarts={state.currentDarts}
            />
          </div>
          <HistoryPanel history={state.history} />
        </aside>
      </div>

      <WinDialog
        open={!!state.winnerId}
        winnerName={winner?.name}
        onRestart={restartGame}
        onQuit={quitGame}
      />

      <p className="text-center text-xs text-muted-foreground mt-6">
        Mobile: przytrzymaj tarczę (~350 ms) aby aktywować lupę z celownikiem. Puść, aby zatwierdzić trafienie.
      </p>
    </main>
  );
};

export default Index;
