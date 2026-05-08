import { z } from "zod";

export const skillLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email jest wymagany.")
    .email("Podaj poprawny adres email."),
  password: z.string().min(1, "Hasło jest wymagane."),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email jest wymagany.")
      .email("Podaj poprawny adres email."),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków.")
      .max(80, "Hasło może mieć maksymalnie 80 znaków."),
    confirmPassword: z.string().min(1, "Powtórz hasło."),

    displayName: z
      .string()
      .trim()
      .min(2, "Nazwa gracza musi mieć co najmniej 2 znaki.")
      .max(24, "Nazwa gracza może mieć maksymalnie 24 znaki."),
    defaultGameMode: z.coerce
      .number()
      .refine((value) => value === 301 || value === 501, {
        message: "Wybierz tryb 301 albo 501.",
      }),
    skillLevel: skillLevelSchema,
    localPlayersCount: z.coerce
      .number()
      .int("Liczba graczy musi być liczbą całkowitą.")
      .min(1, "Minimalna liczba graczy to 1.")
      .max(8, "Maksymalna liczba graczy to 8."),
    localPlayerNames: z.array(
      z.object({
        name: z.string().max(20, "Nazwa może mieć maksymalnie 20 znaków."),
      }),
    ),

    saveGameStats: z.boolean(),
    acceptedTerms: z.boolean().refine((value) => value === true, {
      message: "Musisz zaakceptować regulamin.",
    }),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Hasła muszą być takie same.",
      });
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type SkillLevel = z.infer<typeof skillLevelSchema>;

export const skillLevelLabels: Record<SkillLevel, string> = {
  BEGINNER: "Początkujący",
  INTERMEDIATE: "Średni",
  ADVANCED: "Zaawansowany",
};
