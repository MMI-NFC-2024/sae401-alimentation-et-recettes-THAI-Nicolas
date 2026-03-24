import { z } from "astro/zod";

// Schéma de validation pour l'objectif santé de l'utilisateur
const objectifSanteSchema = z
  .enum(["Prise de masse", "Perte de poids", "Se maintenir", "Se Maintenir"])
  .transform((value) => (value === "Se Maintenir" ? "Se maintenir" : value))
  .optional();

// Schéma de validation pour l'avatar de l'utilisateur
const optionalFileSchema = z.preprocess((value) => {
  if (!(value instanceof File)) {
    return undefined;
  }

  return value.size > 0 ? value : undefined;
}, z.instanceof(File).optional());

// Schéma de validation pour l'âge de l'utilisateur
const optionalAgeSchema = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().int("L'age doit etre un nombre entier").min(13, "L'age minimum est 13 ans").max(120, "L'age maximum est 120 ans").optional());

// Schéma de validation pour la mise à jour du profil utilisateur (nom, bio, age, objectif_sante, avatar)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(80, "Le nom est trop long"),
  bio: z
    .string()
    .trim()
    .max(500, "La bio est trop longue")
    .optional()
    .default(""),
  age: optionalAgeSchema,
  objectif_sante: objectifSanteSchema,
  avatar: optionalFileSchema,
  returnTo: z.string().trim().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
