import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft, Home, RotateCcw, Target } from "lucide-react";

import { useGameState } from "@/hooks/useGameState";
import { useAuth } from "@/hooks/useAuth";
import { GameSetup } from "@/components/GameSetup";
import { Dartboard } from "@/components/Dartboard";
import { PlayerPanel } from "@/components/PlayerPanel";
import { TurnControls } from "@/components/TurnControls";
import { HistoryPanel } from "@/components/HistoryPanel";
import { WinDialog } from "@/components/WinDialog";
import { Button } from "@/components/ui/button";
import { TurnSummaryOverlay } from "@/components/TurnSummaryOverlay";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { GameMode } from "@/lib/gameLogic";

const screenVariants: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.98,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -18,
    scale: 0.98,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const Index = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const defaultGameSetup = useMemo<{ mode: GameMode; names: string[] }>(() => {
    if (!user) {
      return {
        mode: 501,
        names: ["Gracz 1", "Gracz 2"],
      };
    }

    const playersCount = Math.min(Math.max(user.localPlayersCount || 2, 1), 8);

    const savedNames = Array.isArray(user.localPlayerNames)
      ? user.localPlayerNames
      : [];

    const names = Array.from({ length: playersCount }, (_, index) => {
      const name = savedNames[index];

      if (typeof name !== "string" || name.trim().length === 0) {
        return `Gracz ${index + 1}`;
      }

      return name.trim();
    });

    const mode: GameMode = user.defaultGameMode === 301 ? 301 : 501;

    return {
      mode,
      names,
    };
  }, [user]);

  const {
    state,
    newGame,
    turnSummary,
    lastUndoLabel,
    restartGame,
    quitGame,
    addDart,
    finishTurn,
    undo,
  } = useGameState();

  const [confirmAction, setConfirmAction] = useState<"restart" | "quit" | null>(
    null,
  );

  const winner = state?.players.find((p) => p.id === state.winnerId);

  return (
    <AnimatePresence mode="wait">
      {!state ? (
        <motion.main
          key="game-setup"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-background text-foreground p-3 sm:p-5"
        >
          <div className="max-w-7xl mx-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ekran główny
            </Button>

            <h1 className="sr-only">
              Dart Score Tracker — interaktywna tarcza do darta 301 i 501
            </h1>

            <GameSetup
              onStart={newGame}
              initialMode={defaultGameSetup.mode}
              initialNames={defaultGameSetup.names}
            />
          </div>
        </motion.main>
      ) : (
        <motion.main
          key="game-board"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-background text-foreground p-3 sm:p-5 max-w-7xl mx-auto overflow-x-hidden"
        >
          <header className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>

              <div>
                <h1 className="font-display text-xl font-bold leading-none">
                  DART
                  <span className="text-primary-contrast">{state.mode}</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  {state.players.length} graczy
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Ekran główny</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmAction("restart")}
              >
                <RotateCcw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Restart</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmAction("quit")}
              >
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Zakończ grę</span>
              </Button>
            </div>
          </header>

          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <section className="relative overflow-visible space-y-4">
              <div className="relative z-10 lg:hidden">
                <PlayerPanel
                  players={state.players}
                  currentIdx={state.currentPlayerIdx}
                  winnerId={state.winnerId}
                  currentDarts={state.currentDarts}
                />
              </div>

              <Dartboard
                onHit={addDart}
                onUndo={undo}
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

              {lastUndoLabel && (
                <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-center font-display text-sm font-bold text-accent">
                  Cofnięto: {lastUndoLabel}
                </div>
              )}
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

          <TurnSummaryOverlay turn={turnSummary} />

          <ConfirmModal
            open={confirmAction === "restart"}
            title="Zrestartować grę?"
            description="Aktualna rozgrywka zostanie rozpoczęta od nowa. Wyniki i historia tej gry zostaną usunięte."
            confirmText="Tak, restartuj"
            cancelText="Anuluj"
            danger
            onCancel={() => setConfirmAction(null)}
            onConfirm={() => {
              restartGame();
              setConfirmAction(null);
            }}
          />

          <ConfirmModal
            open={confirmAction === "quit"}
            title="Zakończyć grę?"
            description="Wrócisz do ekranu konfiguracji nowej gry. Aktualna rozgrywka zostanie zakończona."
            confirmText="Tak, zakończ"
            cancelText="Anuluj"
            danger
            onCancel={() => setConfirmAction(null)}
            onConfirm={() => {
              quitGame();
              setConfirmAction(null);
            }}
          />

          <WinDialog
            open={!!state.winnerId}
            winnerName={winner?.name}
            onRestart={restartGame}
            onQuit={quitGame}
          />

          <p className="text-center text-xs text-muted-foreground mt-6">
            Mobile: przytrzymaj tarczę (~350 ms) aby aktywować lupę z
            celownikiem. Puść, aby zatwierdzić trafienie.
          </p>
        </motion.main>
      )}
    </AnimatePresence>
  );
};

export default Index;
