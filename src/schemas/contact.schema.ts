import { z } from "astro/zod";

// Schema reutilisable (action serveur + futur usage client si besoin)
export const contactFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(60, "Le prénom est trop long"),
  lastName: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(60, "Le nom est trop long"),
  email: z
    .string()
    .trim()
    .email("L'email doit être valide")
    .max(120, "L'email est trop long"),
  subject: z
    .string()
    .trim()
    .min(5, "Le sujet doit contenir au moins 5 caractères")
    .max(120, "Le sujet est trop long"),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message est trop long"),
  hpField: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
