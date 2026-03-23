import { z } from "astro/zod";

const objectifSanteSchema = z
  .enum(["Prise de masse", "Perte de poids", "Se maintenir", "Se Maintenir"])
  .transform((value) => (value === "Se Maintenir" ? "Se maintenir" : value))
  .optional();

const optionalFileSchema = z.preprocess((value) => {
  if (!(value instanceof File)) {
    return undefined;
  }

  return value.size > 0 ? value : undefined;
}, z.instanceof(File).optional());

const optionalAgeSchema = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().int("L'age doit etre un nombre entier").min(13, "L'age minimum est 13 ans").max(120, "L'age maximum est 120 ans").optional());

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
