import { z } from "astro/zod";

const objectifSanteSchema = z.enum([
  "Prise de masse",
  "Perte de poids",
  "Équilibre",
]);

const categorieSchema = z.enum(["Entrée", "Plat", "Dessert", "Boisson"]);
const difficulteSchema = z.enum(["facile", "moyen", "difficile"]);

const optionalFileSchema = z.preprocess((value) => {
  if (!(value instanceof File)) {
    return undefined;
  }

  return value.size > 0 ? value : undefined;
}, z.instanceof(File).optional());

const optionalNumberSchema = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().optional());

export const createRecetteSchema = z.object({
  titre: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caracteres")
    .max(120, "Le titre est trop long"),
  description: z
    .string()
    .trim()
    .max(3000, "La description est trop longue")
    .optional()
    .default(""),
  difficulte: difficulteSchema,
  categorie: categorieSchema,
  objectif_sante: objectifSanteSchema,
  temps_total: z.coerce
    .number()
    .min(1, "Le temps total doit etre superieur a 0"),
  portions: z.coerce
    .number()
    .int("Le nombre de portions doit etre un entier")
    .min(1, "Le nombre de portions doit etre superieur a 0"),
  image: optionalFileSchema,
  returnTo: z.string().trim().optional(),
});

export const updateRecetteSchema = z.object({
  recetteId: z.string().trim().min(1, "Recette invalide"),
  titre: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caracteres")
    .max(120, "Le titre est trop long")
    .optional(),
  description: z
    .string()
    .trim()
    .max(3000, "La description est trop longue")
    .optional(),
  difficulte: difficulteSchema.optional(),
  categorie: categorieSchema.optional(),
  objectif_sante: objectifSanteSchema.optional(),
  temps_total: optionalNumberSchema,
  portions: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }

    return value;
  }, z.coerce.number().int("Le nombre de portions doit etre un entier").min(1, "Le nombre de portions doit etre superieur a 0").optional()),
  image: optionalFileSchema,
  compositionJson: z.string().trim().optional(),
  etapesJson: z.string().trim().optional(),
  returnTo: z.string().trim().optional(),
});

export const deleteRecetteSchema = z.object({
  recetteId: z.string().trim().min(1, "Recette invalide"),
  returnTo: z.string().trim().optional(),
});

export type CreateRecetteInput = z.infer<typeof createRecetteSchema>;
export type UpdateRecetteInput = z.infer<typeof updateRecetteSchema>;
export type DeleteRecetteInput = z.infer<typeof deleteRecetteSchema>;
