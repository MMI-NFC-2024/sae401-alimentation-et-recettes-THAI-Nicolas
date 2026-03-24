import { z } from "astro/zod";

// Limite de taille pour les images de recettes (5 Mo)
const MAX_RECETTE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_RECETTE_IMAGE_SIZE_MESSAGE = "L'image est trop lourde (max 5 Mo).";

// Schéma de validation pour les objectifs santé des recettes
const objectifSanteSchema = z.enum([
  "Prise de masse",
  "Perte de poids",
  "Équilibre",
]);

const categorieSchema = z.enum(["Entrée", "Plat", "Dessert", "Boisson"]);

// Schéma pour les images required : on verifie que c'est un fichier, que sa taille est > 0 (pour eviter les fichiers vides) et qu'elle ne depasse pas la limite autorisee.
const requiredFileSchema = z.preprocess(
  (value) => {
    if (!(value instanceof File)) {
      return undefined;
    }

    return value.size > 0 ? value : undefined;
  },
  z
    .instanceof(File, { message: "L'image est obligatoire" })
    .refine(
      (file) => file.size <= MAX_RECETTE_IMAGE_SIZE_BYTES,
      MAX_RECETTE_IMAGE_SIZE_MESSAGE,
    ),
);

// Schema pour les images optionnelles : on verifie que c'est un fichier, que sa taille est > 0 (pour eviter les fichiers vides) et qu'elle ne depasse pas la limite autorisee.
const optionalFileSchema = z.preprocess(
  (value) => {
    if (!(value instanceof File)) {
      return undefined;
    }

    return value.size > 0 ? value : undefined;
  },
  z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_RECETTE_IMAGE_SIZE_BYTES,
      MAX_RECETTE_IMAGE_SIZE_MESSAGE,
    )
    .optional(),
);

// Schéma de validation pour les nombres optionnels
const optionalNumberSchema = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().optional());

// Schéma de validation pour les régimes alimentaires (array de strings optionnel, avec nettoyage des entrées)
const optionalRegimesSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value
        .map((entry) => String(entry).trim())
        .filter((entry) => entry.length > 0);
    }

    const normalized = String(value).trim();
    return normalized.length > 0 ? [normalized] : [];
  },
  z.array(z.string().trim().min(1, "Regime invalide")).optional(),
);

// Une fonction qui retourne un schéma de validation pour un champ qui doit etre une string contenant un JSON array non vide ( c'est pour les compositions et les étapes des recettes)
function nonEmptyJsonArraySchema(errorMessage: string) {
  return z
    .string()
    .trim()
    .refine((value) => {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    }, errorMessage);
}

// Schéma de validation de création d'une recette
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
  categorie: categorieSchema,
  objectif_sante: objectifSanteSchema,
  temps_total: z.coerce
    .number()
    .min(1, "Le temps total doit etre superieur a 0"),
  portions: z.coerce
    .number()
    .int("Le nombre de portions doit etre un entier")
    .min(1, "Le nombre de portions doit etre superieur a 0"),
  kcal_portion: z.coerce
    .number()
    .min(0, "Les kcal par portion doivent etre superieures ou egales a 0"),
  total_proteines: z.coerce
    .number()
    .min(0, "Le total des proteines doit etre superieur ou egal a 0"),
  total_glucides: z.coerce
    .number()
    .min(0, "Le total des glucides doit etre superieur ou egal a 0"),
  total_lipides: z.coerce
    .number()
    .min(0, "Le total des lipides doit etre superieur ou egal a 0"),
  regimes: optionalRegimesSchema,
  image: requiredFileSchema,
  compositionJson: nonEmptyJsonArraySchema("Ajoutez au moins un ingredient."),
  etapesJson: nonEmptyJsonArraySchema("Ajoutez au moins une etape."),
  returnTo: z.string().trim().optional(),
});

// Schéma de validation de modification d'une recette
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
  categorie: categorieSchema.optional(),
  objectif_sante: objectifSanteSchema.optional(),
  temps_total: optionalNumberSchema,
  portions: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }

    return value;
  }, z.coerce.number().int("Le nombre de portions doit etre un entier").min(1, "Le nombre de portions doit etre superieur a 0").optional()),
  kcal_portion: optionalNumberSchema,
  total_proteines: optionalNumberSchema,
  total_glucides: optionalNumberSchema,
  total_lipides: optionalNumberSchema,
  regimes: optionalRegimesSchema,
  image: optionalFileSchema,
  compositionJson: nonEmptyJsonArraySchema("Ajoutez au moins un ingredient."),
  etapesJson: nonEmptyJsonArraySchema("Ajoutez au moins une etape."),
  returnTo: z.string().trim().optional(),
});

// Schéma de validation de suppression d'une recette
export const deleteRecetteSchema = z.object({
  recetteId: z.string().trim().min(1, "Recette invalide"),
  returnTo: z.string().trim().optional(),
});

export type CreateRecetteInput = z.infer<typeof createRecetteSchema>;
export type UpdateRecetteInput = z.infer<typeof updateRecetteSchema>;
export type DeleteRecetteInput = z.infer<typeof deleteRecetteSchema>;
