import { skillLevelLabels, type RegisterFormValues } from "@/lib/validation/authSchemas";

type Props = {
  values: RegisterFormValues;
};

export function RegisterStepSummary({ values }: Props) {
  const playerNames = values.localPlayerNames
    .slice(0, values.localPlayersCount)
    .map((player, index) => {
      const name = player.name.trim();
      return name.length > 0 ? name : `Gracz ${index + 1}`;
    });

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border bg-secondary/25 p-4">
        <p className="mb-3 font-display text-xl font-bold">Dane konta</p>

        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {values.email}
          </p>

          <p>
            <span className="text-muted-foreground">Nazwa gracza:</span>{" "}
            {values.displayName}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/25 p-4">
        <p className="mb-3 font-display text-xl font-bold">Preferencje gry</p>

        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Tryb gry:</span>{" "}
            {values.defaultGameMode}
          </p>

          <p>
            <span className="text-muted-foreground">
              Poziom zaawansowania:
            </span>{" "}
            {skillLevelLabels[values.skillLevel]}
          </p>

          <p>
            <span className="text-muted-foreground">
              Liczba graczy lokalnie:
            </span>{" "}
            {values.localPlayersCount}
          </p>

          <p>
            <span className="text-muted-foreground">
              Zapisywanie statystyk:
            </span>{" "}
            {values.saveGameStats ? "Tak" : "Nie"}
          </p>

          <p>
            <span className="text-muted-foreground">Regulamin:</span>{" "}
            {values.acceptedTerms ? "Zaakceptowany" : "Niezaakceptowany"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/25 p-4">
        <p className="mb-3 font-display text-xl font-bold">
          Domyślni gracze lokalni
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {playerNames.map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="rounded-xl border border-border bg-card/70 px-3 py-2 text-sm"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}