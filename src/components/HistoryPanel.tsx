import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TurnRecord } from "@/lib/gameLogic";

interface Props {
  history: TurnRecord[];
}

export function HistoryPanel({ history }: Props) {
  const reversed = [...history].reverse();
  return (
    <Card className="p-3 bg-card/60 border-border">
      <h2 className="font-display uppercase text-xs tracking-wider text-muted-foreground mb-2">
        Historia rzutów
      </h2>
      <ScrollArea className="h-48 lg:h-72 pr-2">
        {reversed.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">Brak rzutów.</p>
        )}
        <ul className="space-y-1.5">
          {reversed.map((t, i) => (
            <li
              key={history.length - i}
              className={`text-sm rounded-md px-2 py-1.5 flex items-center justify-between gap-2 ${
                t.bust ? "bg-destructive/10 text-destructive-foreground" : "bg-secondary/40"
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">{t.playerName}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {t.darts.map((d) => d.label).join(" · ") || "—"}
                </span>
              </div>
              <div className="text-right shrink-0">
                {t.bust ? (
                  <span className="font-display text-destructive">BUST</span>
                ) : (
                  <span className="font-display text-accent">−{t.totalScored}</span>
                )}
                <div className="text-xs text-muted-foreground">→ {t.endScore}</div>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
