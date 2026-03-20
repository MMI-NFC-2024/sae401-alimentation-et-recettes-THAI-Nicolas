import { z } from "astro/zod";

// Schema pour le formulaire de connexion
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("L'email doit être valide")
    .max(120, "L'email est trop long"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long"),
  // Sert a rediriger vers la page initialement demandee apres connexion.
  returnTo: z.string().optional(),
});

// Schema pour le formulaire d'inscription
export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("L'email doit être valide")
      .max(120, "L'email est trop long"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(100, "Le mot de passe est trop long"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
