import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  skillLevelLabels,
  type RegisterFormValues,
  type SkillLevel,
} from "@/lib/validation/authSchemas";

type Props = {
  control: Control<RegisterFormValues>;
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  watch: UseFormWatch<RegisterFormValues>;
  setValue: UseFormSetValue<RegisterFormValues>;
};

export function RegisterStepProfile({
  control,
  register,
  errors,
  watch,
  setValue,
}: Props) {
  const { fields, replace } = useFieldArray({
    control,
    name: "localPlayerNames",
  });

  const values = watch();
  const localPlayersCount = values.localPlayersCount || 1;

  const syncPlayerNameFields = (count: number) => {
    const safeCount = Math.max(1, Math.min(8, Number(count) || 1));
    const currentNames = values.localPlayerNames || [];

    replace(
      Array.from({ length: safeCount }, (_, index) => ({
        name: currentNames[index]?.name || `Gracz ${index + 1}`,
      })),
    );

    setValue("localPlayersCount", safeCount, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <section className="space-y-5">
      <div>
        <label
          htmlFor="register-display-name"
          className="mb-1 block text-sm font-medium"
        >
          Nazwa gracza wyświetlana w grze
        </label>

        <Input
          id="register-display-name"
          className="bg-secondary/50"
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={
            errors.displayName ? "register-display-name-error" : undefined
          }
          {...register("displayName")}
        />

        {errors.displayName && (
          <p
            id="register-display-name-error"
            className="mt-1 text-sm text-destructive-contrast"
          >
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div>
        <p id="default-game-mode-label" className="mb-2 text-sm font-medium">
          Domyślny tryb gry
        </p>

        <div
          className="grid grid-cols-2 gap-3"
          role="group"
          aria-labelledby="default-game-mode-label"
        >
          {[301, 501].map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={values.defaultGameMode === mode}
              onClick={() =>
                setValue("defaultGameMode", mode as 301 | 501, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className={`focus-ring rounded-xl border-2 py-4 font-display text-3xl font-bold transition-all ${
                values.defaultGameMode === mode
                  ? "border-primary bg-primary/10 text-primary-contrast"
                  : "border-border bg-secondary/40 text-foreground hover:border-primary/40"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {errors.defaultGameMode && (
          <p className="mt-1 text-sm text-destructive-contrast">
            {errors.defaultGameMode.message}
          </p>
        )}
      </div>

      <div>
        <p id="skill-level-label" className="mb-2 text-sm font-medium">
          Poziom zaawansowania
        </p>

        <div
          className="grid gap-2 sm:grid-cols-3"
          role="group"
          aria-labelledby="skill-level-label"
        >
          {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as SkillLevel[]).map(
            (level) => (
              <button
                key={level}
                type="button"
                aria-pressed={values.skillLevel === level}
                onClick={() =>
                  setValue("skillLevel", level, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={`focus-ring rounded-xl border px-3 py-3 font-semibold transition-all ${
                  values.skillLevel === level
                    ? "border-primary bg-primary/10 text-primary-contrast"
                    : "border-border bg-secondary/40 text-foreground hover:border-primary/40"
                }`}
              >
                {skillLevelLabels[level]}
              </button>
            ),
          )}
        </div>

        {errors.skillLevel && (
          <p className="mt-1 text-sm text-destructive-contrast">
            {errors.skillLevel.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="register-local-players-count"
          className="mb-1 block text-sm font-medium"
        >
          Domyślna liczba graczy w grze lokalnej
        </label>

        <Input
          id="register-local-players-count"
          type="number"
          min={1}
          max={8}
          className="bg-secondary/50"
          aria-invalid={Boolean(errors.localPlayersCount)}
          aria-describedby={
            errors.localPlayersCount
              ? "register-local-players-count-error"
              : undefined
          }
          {...register("localPlayersCount", {
            valueAsNumber: true,
            onChange: (event) => {
              syncPlayerNameFields(Number(event.target.value));
            },
          })}
        />

        {errors.localPlayersCount && (
          <p
            id="register-local-players-count-error"
            className="mt-1 text-sm text-destructive-contrast"
          >
            {errors.localPlayersCount.message}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Domyślne nazwy graczy</p>

        <div className="space-y-2">
          {fields.slice(0, localPlayersCount).map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary font-display text-primary">
                {index + 1}
              </div>

              <Input
                className="bg-secondary/50"
                placeholder={`Gracz ${index + 1}`}
                aria-label={`Nazwa gracza ${index + 1}`}
                {...register(`localPlayerNames.${index}.name`)}
              />
            </div>
          ))}
        </div>

        {errors.localPlayerNames && (
          <p className="mt-1 text-sm text-destructive-contrast">Sprawdź nazwy graczy.</p>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-secondary/25 p-4">
        <label htmlFor="save-game-stats" className="flex gap-3 text-sm">
          <input
            id="save-game-stats"
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            {...register("saveGameStats")}
          />

          <span>Chcę zapisywać statystyki moich gier.</span>
        </label>

        <label htmlFor="accepted-terms" className="flex gap-3 text-sm">
          <input
            id="accepted-terms"
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            aria-invalid={Boolean(errors.acceptedTerms)}
            aria-describedby={
              errors.acceptedTerms ? "accepted-terms-error" : undefined
            }
            {...register("acceptedTerms")}
          />

          <span>Akceptuję regulamin.</span>
        </label>

        {errors.acceptedTerms && (
          <p
            id="accepted-terms-error"
            role="alert"
            className="text-sm text-destructive-contrast"
          >
            {errors.acceptedTerms.message}
          </p>
        )}
      </div>
    </section>
  );
}
