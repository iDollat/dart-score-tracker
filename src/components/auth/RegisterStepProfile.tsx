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
        <label className="mb-1 block text-sm font-medium">
          Nazwa gracza wyświetlana w grze
        </label>

        <Input className="bg-secondary/50" {...register("displayName")} />

        {errors.displayName && (
          <p className="mt-1 text-sm text-destructive">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Domyślny tryb gry</p>

        <div className="grid grid-cols-2 gap-3">
          {[301, 501].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                setValue("defaultGameMode", mode as 301 | 501, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className={`rounded-xl border-2 py-4 font-display text-3xl font-bold transition-all ${
                values.defaultGameMode === mode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/40 text-foreground hover:border-primary/40"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {errors.defaultGameMode && (
          <p className="mt-1 text-sm text-destructive">
            {errors.defaultGameMode.message}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Poziom zaawansowania</p>

        <div className="grid gap-2 sm:grid-cols-3">
          {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as SkillLevel[]).map(
            (level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setValue("skillLevel", level, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={`rounded-xl border px-3 py-3 font-semibold transition-all ${
                  values.skillLevel === level
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/40 text-foreground hover:border-primary/40"
                }`}
              >
                {skillLevelLabels[level]}
              </button>
            ),
          )}
        </div>

        {errors.skillLevel && (
          <p className="mt-1 text-sm text-destructive">
            {errors.skillLevel.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Domyślna liczba graczy w grze lokalnej
        </label>

        <Input
          type="number"
          min={1}
          max={8}
          className="bg-secondary/50"
          {...register("localPlayersCount", {
            valueAsNumber: true,
            onChange: (event) => {
              syncPlayerNameFields(Number(event.target.value));
            },
          })}
        />

        {errors.localPlayersCount && (
          <p className="mt-1 text-sm text-destructive">
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
                {...register(`localPlayerNames.${index}.name`)}
              />
            </div>
          ))}
        </div>

        {errors.localPlayerNames && (
          <p className="mt-1 text-sm text-destructive">
            Sprawdź nazwy graczy.
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-secondary/25 p-4">
        <label className="flex gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            {...register("saveGameStats")}
          />

          <span>Chcę zapisywać statystyki moich gier.</span>
        </label>

        <label className="flex gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            {...register("acceptedTerms")}
          />

          <span>Akceptuję regulamin.</span>
        </label>

        {errors.acceptedTerms && (
          <p className="text-sm text-destructive">
            {errors.acceptedTerms.message}
          </p>
        )}
      </div>
    </section>
  );
}