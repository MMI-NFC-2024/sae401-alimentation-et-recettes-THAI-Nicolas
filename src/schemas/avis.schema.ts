import { z } from "astro/zod";

// Schéma de validation pour la création d'un avis (note et commentaire) sur une recette,
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
  //redirection optionnelle après la création
  returnTo: z.string().trim().optional(),
});

// Suppression d'un avis par son ID, avec une redirection optionnelle après suppression
export const deleteAvisSchema = z.object({
  avisId: z.string().trim().min(1, "Avis invalide"),
  returnTo: z.string().trim().optional(),
});

export type CreateAvisInput = z.infer<typeof createAvisSchema>;
export type DeleteAvisInput = z.infer<typeof deleteAvisSchema>;
