import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validation/authSchemas";

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitError(null);

      await login(values);

      navigate("/", { replace: true });
    } catch (err) {
      const apiError = err as Error & { fields?: Record<string, string> };

      if (apiError.fields) {
        Object.entries(apiError.fields).forEach(([name, message]) => {
          setError(name as keyof LoginFormValues, {
            type: "server",
            message,
          });
        });
      }

      setSubmitError(apiError.message || "Nie udało się zalogować.");
    }
  };

  return (
    <>
      {submitError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-contrast"
        >
          {submitError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="login-email"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </label>

          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            className="bg-secondary/50"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />

          {errors.email && (
            <p
              id="login-email-error"
              className="mt-1 text-sm text-destructive-contrast"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1 block text-sm font-medium"
          >
            Hasło
          </label>

          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="bg-secondary/50"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            {...register("password")}
          />

          {errors.password && (
            <p
              id="login-password-error"
              className="mt-1 text-sm text-destructive-contrast"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-primary font-display text-lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Logowanie...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
              Zaloguj
            </>
          )}
        </Button>

        {isSubmitting && (
          <p className="sr-only" role="status">
            Trwa logowanie. Proszę czekać.
          </p>
        )}
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Nie masz konta?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary-contrast underline underline-offset-2"
        >
          Zarejestruj się
        </Link>
      </p>
    </>
  );
}
