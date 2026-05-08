import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterProgress } from "@/components/auth/RegisterProgress";
import { RegisterStepAccount } from "@/components/auth/RegisterStepAccount";
import { RegisterStepProfile } from "@/components/auth/RegisterStepProfile";
import { RegisterStepSummary } from "@/components/auth/RegisterStepSummary";
import { Button } from "@/components/ui/button";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validation/authSchemas";

export default function Register() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();

  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      defaultGameMode: 501,
      skillLevel: "BEGINNER",
      localPlayersCount: 2,
      localPlayerNames: [{ name: "Gracz 1" }, { name: "Gracz 2" }],
      saveGameStats: false,
      acceptedTerms: false,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const values = watch();

  const subtitle = useMemo(() => {
    if (step === 1) return "Krok 1 z 3 — dane konta.";
    if (step === 2) return "Krok 2 z 3 — preferencje gry.";
    return "Krok 3 z 3 — podsumowanie.";
  }, [step]);

  useEffect(() => {
    if (step > 1) {
      backButtonRef.current?.focus();
    }
  }, [step]);

  const goNext = async () => {
    setSubmitError(null);

    if (step === 1) {
      const valid = await trigger(["email", "password", "confirmPassword"]);
      if (!valid) return;

      setStep(2);
      return;
    }

    if (step === 2) {
      const valid = await trigger([
        "displayName",
        "defaultGameMode",
        "skillLevel",
        "localPlayersCount",
        "localPlayerNames",
        "saveGameStats",
        "acceptedTerms",
      ]);

      if (!valid) return;

      setStep(3);
    }
  };

  const onSubmit = async (formValues: RegisterFormValues) => {
    try {
      setSubmitError(null);

      await registerAccount(formValues);
      navigate("/", { replace: true });
    } catch (err) {
      const apiError = err as Error & { fields?: Record<string, string> };

      if (apiError.fields) {
        Object.entries(apiError.fields).forEach(([name, message]) => {
          setError(name as keyof RegisterFormValues, {
            type: "server",
            message,
          });
        });
      }

      setSubmitError(apiError.message || "Nie udało się utworzyć konta.");
      setStep(1);
    }
  };

  const submitRegistration = async () => {
    await handleSubmit(onSubmit)();
  };

  return (
    <AuthLayout title="Rejestracja" subtitle={subtitle}>
      <RegisterProgress step={step} />

      {submitError && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-contrast">
          {submitError}
        </div>
      )}

      <div aria-live="polite">
        {step === 1 && (
          <RegisterStepAccount
            register={register}
            errors={errors}
            passwordValue={values.password}
            emailValue={values.email}
            displayNameValue={values.displayName}
          />
        )}

        {step === 2 && (
          <RegisterStepProfile
            control={control}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        )}

        {step === 3 && <RegisterStepSummary values={values} />}

        <div className="mt-6 flex justify-between gap-3">
          <Button
            ref={backButtonRef}
            type="button"
            variant="outline"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Wstecz
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              className="bg-gradient-primary"
              disabled={isSubmitting}
              onClick={() => void goNext()}
            >
              Dalej
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-gradient-primary"
              disabled={isSubmitting}
              onClick={() => void submitRegistration()}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Utwórz konto
            </Button>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link to="/login" className="font-semibold text-primary-contrast underline underline-offset-2">
          Zaloguj się
        </Link>
      </p>
    </AuthLayout>
  );
}
