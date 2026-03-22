import { z } from "astro/zod";

export const createAvisSchema = z.object({
  recetteId: z.string().trim().min(1, "Recette invalide"),
  note: z.coerce
    .number()
    .int("La note doit etre un nombre entier")
    .min(1, "La note minimale est 1")
    .max(5, "La note maximale est 5"),
  commentaire: z
    .string()
    .trim()
    .max(500, "Le commentaire est trop long")
    .optional(),
  returnTo: z.string().trim().optional(),
});

export const deleteAvisSchema = z.object({
  avisId: z.string().trim().min(1, "Avis invalide"),
  returnTo: z.string().trim().optional(),
});

export type CreateAvisInput = z.infer<typeof createAvisSchema>;
export type DeleteAvisInput = z.infer<typeof deleteAvisSchema>;
