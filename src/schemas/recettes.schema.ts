import { z } from "astro/zod";

const MAX_RECETTE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_RECETTE_IMAGE_SIZE_MESSAGE = "L'image est trop lourde (max 5 Mo).";

const objectifSanteSchema = z.enum([
  "Prise de masse",
  "Perte de poids",
  "Équilibre",
]);

const categorieSchema = z.enum(["Entrée", "Plat", "Dessert", "Boisson"]);

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

const optionalNumberSchema = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().optional());

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

export const deleteRecetteSchema = z.object({
  recetteId: z.string().trim().min(1, "Recette invalide"),
  returnTo: z.string().trim().optional(),
});

export type CreateRecetteInput = z.infer<typeof createRecetteSchema>;
export type UpdateRecetteInput = z.infer<typeof updateRecetteSchema>;
export type DeleteRecetteInput = z.infer<typeof deleteRecetteSchema>;
