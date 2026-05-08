import { useMemo } from "react";
import { CheckCircle2, Circle, ShieldAlert, ShieldCheck } from "lucide-react";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnPlPackage from "@zxcvbn-ts/language-pl";

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnPlPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnPlPackage.translations,
};

zxcvbnOptions.setOptions(options);

interface Props {
  password: string;
  email?: string;
  displayName?: string;
}

function getScoreMeta(score: number, isEmpty: boolean) {
  if (isEmpty) {
    return {
      label: "Wpisz hasło",
      widthClassName: "w-0",
      barClassName: "bg-muted",
      textClassName: "text-muted-foreground",
    };
  }

  if (score <= 1) {
    return {
      label: "Słabe hasło",
      widthClassName: "w-1/4",
      barClassName: "bg-destructive",
      textClassName: "text-destructive-contrast",
    };
  }

  if (score === 2) {
    return {
      label: "Średnie hasło",
      widthClassName: "w-2/4",
      barClassName: "bg-amber-400",
      textClassName: "text-amber-400",
    };
  }

  if (score === 3) {
    return {
      label: "Dobre hasło",
      widthClassName: "w-3/4",
      barClassName: "bg-primary",
      textClassName: "text-primary",
    };
  }

  return {
    label: "Bardzo mocne hasło",
    widthClassName: "w-full",
    barClassName: "bg-success",
    textClassName: "text-success",
  };
}

function formatCrackTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "bardzo długo";
  if (seconds < 1) return "mniej niż sekundę";
  if (seconds < 60) return `${Math.round(seconds)} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)} godz.`;
  if (seconds < 31_536_000) return `${Math.round(seconds / 86_400)} dni`;
  return `${Math.round(seconds / 31_536_000)} lat`;
}

export function PasswordStrengthMeter({
  password,
  email = "",
  displayName = "",
}: Props) {
  const result = useMemo(() => {
    const userInputs = [email, displayName].filter(
      (value) => value.trim().length > 0,
    );

    return zxcvbn(password, userInputs);
  }, [password, email, displayName]);

  const isEmpty = password.length === 0;
  const meta = getScoreMeta(result.score, isEmpty);

  const checks = [
    {
      label: "Co najmniej 8 znaków",
      passed: password.length >= 8,
    },
    {
      label: "Mała i wielka litera",
      passed:
        /[a-ząćęłńóśźż]/.test(password) && /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(password),
    },
    {
      label: "Cyfra",
      passed: /\d/.test(password),
    },
    {
      label: "Znak specjalny",
      passed: /[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]/.test(password),
    },
  ];

  const warning = result.feedback.warning;
  const suggestions = result.feedback.suggestions;

  return (
    <div className="mt-3 rounded-xl border border-border/70 bg-background/50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {result.score >= 3 ? (
            <ShieldCheck className="h-4 w-4 text-success" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          )}

          <p className="text-xs font-medium text-muted-foreground">
            Siła hasła
          </p>
        </div>

        <p className={`text-xs font-bold ${meta.textClassName}`}>
          {meta.label}
        </p>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Siła hasła"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={result.score}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${meta.widthClassName} ${meta.barClassName}`}
        />
      </div>

      {!isEmpty && (
        <p className="mt-2 text-xs text-muted-foreground">
          Szacowany czas złamania online:{" "}
          <span className={meta.textClassName}>
            {formatCrackTime(
              result.crackTimesSeconds.onlineThrottling100PerHour,
            )}
          </span>
        </p>
      )}

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {checks.map((check) => (
          <div
            key={check.label}
            className={`flex items-center gap-2 text-xs ${
              check.passed ? "text-success" : "text-muted-foreground"
            }`}
          >
            {check.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}

            <span>{check.label}</span>
          </div>
        ))}
      </div>

      {(warning || suggestions.length > 0) && !isEmpty && (
        <div className="mt-3 rounded-lg border border-border bg-card/70 p-2 text-xs text-muted-foreground">
          {warning && <p className="font-medium text-foreground">{warning}</p>}

          {suggestions.length > 0 && (
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {suggestions.slice(0, 2).map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
