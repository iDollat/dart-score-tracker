import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Lock, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import type { RegisterFormValues } from "@/lib/validation/authSchemas";

interface Props {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  passwordValue: string;
  emailValue: string;
  displayNameValue: string;
}

export function RegisterStepAccount({
  register,
  errors,
  passwordValue,
  emailValue,
  displayNameValue,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>

        <div className="relative mt-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="john_doe@example.com"
            className="pl-9"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </div>

        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-destructive-contrast">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Hasło</Label>

        <div className="relative mt-1">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 znaków"
            className="pl-9"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
        </div>

        {errors.password && (
          <p id="password-error" className="mt-1 text-sm text-destructive-contrast">
            {errors.password.message}
          </p>
        )}

        <PasswordStrengthMeter
          password={passwordValue}
          email={emailValue}
          displayName={displayNameValue}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Powtórz hasło</Label>

        <div className="relative mt-1">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Wpisz hasło ponownie"
            className="pl-9"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
            {...register("confirmPassword")}
          />
        </div>

        {errors.confirmPassword && (
          <p
            id="confirm-password-error"
            className="mt-1 text-sm text-destructive-contrast"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>
  );
}