import { ActionError, defineAction } from "astro:actions";
import { sendContactEmail } from "../lib/services/emailjs.service";
import { contactFormSchema, newsletterSchema } from "../schemas/contact.schema";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { createAvisSchema, deleteAvisSchema } from "../schemas/avis.schema";
import { updateProfileSchema } from "../schemas/profil.schema";
import {
  createRecetteSchema,
  deleteRecetteSchema,
  updateRecetteSchema,
} from "../schemas/recettes.schema";

// Rate-limit volontairement simple (petit site): 5 envois / 10 min / IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestsByIp = new Map<string, number[]>();

function assertWithinRateLimit(ipAddress: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const currentAttempts = requestsByIp.get(ipAddress) ?? [];

  const recentAttempts = currentAttempts.filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw new ActionError({
      code: "TOO_MANY_REQUESTS",
      message: "Trop de tentatives. Merci de reessayer dans quelques minutes.",
    });
  }

  recentAttempts.push(now);
  requestsByIp.set(ipAddress, recentAttempts);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sanitizeReturnTo(returnTo: string | undefined): string {
  const candidate = returnTo?.trim();

  // On autorise uniquement les chemins internes (/...) pour bloquer les open-redirect.
  if (candidate && candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  return "/";
}

function getPbEmailMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const response = (
    error as { response?: { data?: { email?: { message?: string } } } }
  ).response;
  const message = response?.data?.email?.message;

  return typeof message === "string" ? message : undefined;
}

function getPbErrorData(error: unknown): Record<string, unknown> | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const response = (error as { response?: unknown }).response;

  if (typeof response === "object" && response !== null) {
    const responseData = (response as { data?: unknown }).data;

    if (typeof responseData === "object" && responseData !== null) {
      return responseData as Record<string, unknown>;
    }
  }

  const directData = (error as { data?: unknown }).data;
  if (typeof directData === "object" && directData !== null) {
    return directData as Record<string, unknown>;
  }

  return undefined;
}

function getPbFirstFieldMessage(
  error: unknown,
  fieldNames: string[],
): string | undefined {
  const data = getPbErrorData(error);
  if (!data) {
    return undefined;
  }

  for (const fieldName of fieldNames) {
    const entry = data[fieldName] as { message?: unknown } | undefined;

    if (
      entry &&
      typeof entry.message === "string" &&
      entry.message.length > 0
    ) {
      return entry.message;
    }
  }

  return undefined;
}

function getPbErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const response = (error as { response?: unknown }).response;
  if (typeof response === "object" && response !== null) {
    const responseMessage = (response as { message?: unknown }).message;
    if (typeof responseMessage === "string" && responseMessage.length > 0) {
      return responseMessage;
    }

    const responseDataMessage = (response as { data?: { message?: unknown } })
      .data?.message;
    if (
      typeof responseDataMessage === "string" &&
      responseDataMessage.length > 0
    ) {
      return responseDataMessage;
    }
  }

  const genericMessage = (error as { message?: unknown }).message;
  if (typeof genericMessage === "string" && genericMessage.length > 0) {
    return genericMessage;
  }

  return undefined;
}

function getPbErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const status = (error as { status?: unknown }).status;
  if (typeof status === "number") {
    return status;
  }

  const response = (error as { response?: unknown }).response;
  if (typeof response === "object" && response !== null) {
    const code = (response as { code?: unknown }).code;
    if (typeof code === "number") {
      return code;
    }
  }

  return undefined;
}

function formatErrorForLog(error: unknown) {
  const status = getPbErrorStatus(error);
  const message = getPbErrorMessage(error);
  const data = getPbErrorData(error);

  if (typeof error === "object" && error !== null) {
    const name = (error as { name?: unknown }).name;
    return {
      name: typeof name === "string" ? name : undefined,
      status,
      message,
      data,
      raw: error,
    };
  }

  return {
    status,
    message,
    raw: error,
  };
}

function ensureAuthenticatedUserId(context: {
  locals: {
    pb?: {
      authStore?: {
        isValid?: boolean;
        model?: { id?: string } | null;
      };
    };
  };
}): string {
  if (!context.locals.pb?.authStore?.isValid) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Vous devez etre connecte.",
    });
  }

  const authModel = context.locals.pb.authStore.model as { id?: string } | null;
  const userId = authModel?.id;

  if (!userId) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Session invalide. Merci de vous reconnecter.",
    });
  }

  return userId;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function buildUniqueRecetteSlug(
  pb: NonNullable<{
    collection: (name: string) => {
      getFirstListItem: (filter: string) => Promise<unknown>;
    };
  }>,
  title: string,
): Promise<string> {
  const baseSlug = slugify(title) || "recette";

  try {
    await pb.collection("recettes").getFirstListItem(`slug="${baseSlug}"`);
    return `${baseSlug}-${Date.now()}`;
  } catch {
    return baseSlug;
  }
}

function pickRecetteUpdatePayload(input: {
  titre?: string;
  description?: string;
  categorie?: string;
  objectif_sante?: string;
  temps_total?: number;
  portions?: number;
  kcal_portion?: number;
  total_proteines?: number;
  total_glucides?: number;
  total_lipides?: number;
  regimes?: string[];
  image?: File;
}) {
  const payload: Record<string, unknown> = {};

  if (typeof input.titre === "string") {
    payload.titre = input.titre;
    payload.slug = slugify(input.titre) || "recette";
  }

  if (typeof input.description === "string") {
    payload.description = input.description;
  }

  if (typeof input.categorie === "string") {
    payload.categorie = input.categorie;
  }

  if (typeof input.objectif_sante === "string") {
    payload.objectif_sante = input.objectif_sante;
  }

  if (typeof input.temps_total === "number") {
    payload.temps_total = input.temps_total;
  }

  if (typeof input.portions === "number") {
    payload.portions = input.portions;
  }

  if (typeof input.kcal_portion === "number") {
    payload.kcal_portion = input.kcal_portion;
  }

  if (typeof input.total_proteines === "number") {
    payload.total_proteines = input.total_proteines;
  }

  if (typeof input.total_glucides === "number") {
    payload.total_glucides = input.total_glucides;
  }

  if (typeof input.total_lipides === "number") {
    payload.total_lipides = input.total_lipides;
  }

  if (Array.isArray(input.regimes)) {
    payload.regimes = input.regimes;
  }

  if (input.image instanceof File && input.image.size > 0) {
    payload.image = input.image;
  }

  return payload;
}

interface CompositionInputItem {
  ingredientId?: string;
  quantite?: number;
  unite?: string;
}

interface EtapeInputItem {
  titre?: string;
  description?: string;
}

function parseJsonArrayField<T>(
  rawValue: string | undefined,
  label: string,
): T[] | undefined {
  if (!rawValue || rawValue.trim().length === 0) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      throw new Error("Not an array");
    }

    return parsed as T[];
  } catch {
    throw new ActionError({
      code: "BAD_REQUEST",
      message: `Le format des ${label} est invalide.`,
    });
  }
}

function normalizeCompositionUnite(rawUnite: string): string {
  const unite = rawUnite.trim();
  if (unite.length === 0) return "";

  const key = unite
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  const aliases: Record<string, string> = {
    "c. a soupe": "c. à soupe",
    "c a soupe": "c. à soupe",
    "c. a cafe": "c. à café",
    "c a cafe": "c. à café",
    pincee: "pincée",
    piece: "pièce",
    l: "L",
  };

  return aliases[key] ?? unite;
}

function normalizeCompositionItems(items: CompositionInputItem[]) {
  return items
    .map((item) => {
      const ingredientId =
        typeof item.ingredientId === "string" ? item.ingredientId.trim() : "";
      const quantite = Number(item.quantite ?? 0);
      const unite =
        typeof item.unite === "string"
          ? normalizeCompositionUnite(item.unite)
          : "";

      return {
        ingredientId,
        quantite: Number.isFinite(quantite) ? quantite : 0,
        unite,
      };
    })
    .filter((item) => item.ingredientId.length > 0);
}

function normalizeEtapesItems(items: EtapeInputItem[]) {
  return items
    .map((item) => {
      const titre = typeof item.titre === "string" ? item.titre.trim() : "";
      const description =
        typeof item.description === "string" ? item.description.trim() : "";

      return {
        titre,
        description,
      };
    })
    .filter((item) => item.titre.length > 0 || item.description.length > 0);
}

export const server = {
  subscribeNewsletter: defineAction({
    accept: "form",
    input: newsletterSchema,
    handler: async (input, context) => {
      assertWithinRateLimit(context.clientAddress ?? "unknown");

      await sendContactEmail({
        firstName: "Newsletter",
        lastName: "Footer",
        email: input.email,
        subject: "Nouvelle inscription newsletter",
        message: `Nouvel email abonne: ${input.email}`,
      });

      return { success: true };
    },
  }),

  sendContact: defineAction({
    accept: "form",
    input: contactFormSchema,
    handler: async (input, context) => {
      // Honeypot: on retourne un succes silencieux pour ne pas informer le bot.
      if (input.hpField && input.hpField.trim().length > 0) {
        return { success: true };
      }

      assertWithinRateLimit(context.clientAddress ?? "unknown");

      await sendContactEmail({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        subject: input.subject,
        message: input.message,
      });

      return { success: true };
    },
  }),

  login: defineAction({
    accept: "form",
    input: loginSchema,
    handler: async (input, context) => {
      const email = normalizeEmail(input.email);
      const redirectTo = sanitizeReturnTo(input.returnTo);

      try {
        await context.locals.pb
          .collection("users")
          .authWithPassword(email, input.password);
        return { success: true, redirectTo };
      } catch {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe invalide.",
        });
      }
    },
  }),

  register: defineAction({
    accept: "form",
    input: registerSchema,
    handler: async (input, context) => {
      const email = normalizeEmail(input.email);
      const redirectTo = sanitizeReturnTo(input.returnTo || "/profil");

      try {
        await context.locals.pb.collection("users").create({
          email,
          password: input.password,
          passwordConfirm: input.passwordConfirm,
          ...(typeof input.objectif_sante === "string"
            ? { objectif_sante: input.objectif_sante }
            : {}),
        });

        await context.locals.pb
          .collection("users")
          .authWithPassword(email, input.password);
        return { success: true, redirectTo };
      } catch (error) {
        const emailMessage = getPbEmailMessage(error);

        if (emailMessage && /already|existe|used|unique/i.test(emailMessage)) {
          throw new ActionError({
            code: "CONFLICT",
            message: "Cet email est deja utilise.",
          });
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Impossible de creer le compte pour le moment. Verifiez vos informations.",
        });
      }
    },
  }),

  createAvis: defineAction({
    accept: "form",
    input: createAvisSchema,
    handler: async (input, context) => {
      if (!context.locals.pb?.authStore?.isValid) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Vous devez etre connecte pour laisser un avis.",
        });
      }

      const authModel = context.locals.pb.authStore.model as {
        id?: string;
      } | null;
      const userId = authModel?.id;

      if (!userId) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Session invalide. Merci de vous reconnecter.",
        });
      }

      try {
        await context.locals.pb.collection("avis").create({
          recette: input.recetteId,
          user: userId,
          note: input.note,
          commentaire: input.commentaire ?? "",
        });

        return {
          success: true,
          redirectTo: sanitizeReturnTo(input.returnTo),
        };
      } catch (error) {
        console.error("[actions.createAvis] Impossible de creer l'avis", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible d'enregistrer votre avis pour le moment.",
        });
      }
    },
  }),

  deleteAvis: defineAction({
    accept: "form",
    input: deleteAvisSchema,
    handler: async (input, context) => {
      if (!context.locals.pb?.authStore?.isValid) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Vous devez etre connecte pour supprimer un avis.",
        });
      }

      const authModel = context.locals.pb.authStore.model as {
        id?: string;
      } | null;
      const userId = authModel?.id;

      if (!userId) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Session invalide. Merci de vous reconnecter.",
        });
      }

      try {
        const existingAvis = await context.locals.pb
          .collection("avis")
          .getOne(input.avisId);

        if (existingAvis.user !== userId) {
          throw new ActionError({
            code: "FORBIDDEN",
            message: "Vous ne pouvez supprimer que vos propres avis.",
          });
        }

        await context.locals.pb.collection("avis").delete(input.avisId);

        return {
          success: true,
          redirectTo: sanitizeReturnTo(input.returnTo),
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error(
          "[actions.deleteAvis] Impossible de supprimer l'avis",
          error,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de supprimer cet avis pour le moment.",
        });
      }
    },
  }),

  updateProfile: defineAction({
    accept: "form",
    input: updateProfileSchema,
    handler: async (input, context) => {
      const userId = ensureAuthenticatedUserId(context);

      try {
        const payload: Record<string, unknown> = {
          name: input.name,
          bio: input.bio ?? "",
        };

        if (typeof input.age === "number") {
          payload.age = input.age;
        }

        if (typeof input.objectif_sante === "string") {
          payload.objectif_sante = input.objectif_sante;
        }

        if (input.avatar instanceof File && input.avatar.size > 0) {
          payload.avatar = input.avatar;
        }

        await context.locals.pb.collection("users").update(userId, payload);

        return {
          success: true,
          redirectTo:
            sanitizeReturnTo(input.returnTo || "/profil") + "?profile=1",
        };
      } catch (error) {
        console.error(
          "[actions.updateProfile] Impossible de mettre a jour le profil",
          error,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de mettre a jour votre profil pour le moment.",
        });
      }
    },
  }),

  createRecette: defineAction({
    accept: "form",
    input: createRecetteSchema,
    handler: async (input, context) => {
      const userId = ensureAuthenticatedUserId(context);

      try {
        const rawComposition = parseJsonArrayField<CompositionInputItem>(
          input.compositionJson,
          "ingredients",
        );
        const rawEtapes = parseJsonArrayField<EtapeInputItem>(
          input.etapesJson,
          "etapes",
        );

        const compositionItems = rawComposition
          ? normalizeCompositionItems(rawComposition)
          : undefined;
        const etapesItems = rawEtapes
          ? normalizeEtapesItems(rawEtapes)
          : undefined;

        if (!compositionItems || compositionItems.length === 0) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Ajoutez au moins un ingredient.",
          });
        }

        if (!etapesItems || etapesItems.length === 0) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Ajoutez au moins une etape.",
          });
        }

        const slug = await buildUniqueRecetteSlug(
          context.locals.pb,
          input.titre,
        );

        const payload: Record<string, unknown> = {
          titre: input.titre,
          slug,
          description: input.description ?? "",
          categorie: input.categorie,
          objectif_sante: input.objectif_sante,
          temps_total: input.temps_total,
          portions: input.portions,
          kcal_portion: input.kcal_portion,
          total_proteines: input.total_proteines,
          total_glucides: input.total_glucides,
          total_lipides: input.total_lipides,
          user: userId,
        };

        if (Array.isArray(input.regimes) && input.regimes.length > 0) {
          payload.regimes = input.regimes;
        }

        if (input.image instanceof File && input.image.size > 0) {
          payload.image = input.image;
        }

        const createdRecette = await context.locals.pb
          .collection("recettes")
          .create(payload);

        try {
          for (const item of compositionItems) {
            await context.locals.pb.collection("composition").create({
              recette: createdRecette.id,
              ingredient: item.ingredientId,
              quantite: item.quantite,
              unite: item.unite || undefined,
            });
          }

          for (const [index, item] of etapesItems.entries()) {
            await context.locals.pb.collection("etapes").create({
              recette: createdRecette.id,
              numero_ordre: index + 1,
              titre: item.titre,
              description: item.description,
            });
          }
        } catch (error) {
          try {
            await context.locals.pb
              .collection("recettes")
              .delete(createdRecette.id);
          } catch (rollbackError) {
            console.error(
              "[actions.createRecette] Echec du rollback de la recette",
              formatErrorForLog(rollbackError),
            );
          }

          throw error;
        }

        return {
          success: true,
          redirectTo:
            sanitizeReturnTo(input.returnTo || "/profil") + "?recette=created",
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        const pbFieldMessage = getPbFirstFieldMessage(error, [
          "image",
          "slug",
          "titre",
          "regimes",
          "categorie",
          "objectif_sante",
          "ingredient",
          "recette",
          "unite",
          "quantite",
          "numero_ordre",
          "description",
          "compositionJson",
          "etapesJson",
          "user",
        ]);

        if (pbFieldMessage) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: pbFieldMessage,
          });
        }

        const pbMessage = getPbErrorMessage(error);

        if (pbMessage) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: pbMessage,
          });
        }

        const pbStatus = getPbErrorStatus(error);

        if (typeof pbStatus === "number" && pbStatus >= 400 && pbStatus < 500) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message:
              "Certaines donnees de la recette sont invalides. Verifiez l'image, les ingredients et les etapes.",
          });
        }

        console.error(
          "[actions.createRecette] Impossible de creer la recette",
          formatErrorForLog(error),
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de creer la recette pour le moment.",
        });
      }
    },
  }),

  updateRecette: defineAction({
    accept: "form",
    input: updateRecetteSchema,
    handler: async (input, context) => {
      const userId = ensureAuthenticatedUserId(context);

      try {
        const existingRecette = await context.locals.pb
          .collection("recettes")
          .getOne(input.recetteId);

        if (existingRecette.user !== userId) {
          throw new ActionError({
            code: "FORBIDDEN",
            message: "Vous ne pouvez modifier que vos propres recettes.",
          });
        }

        const payload = pickRecetteUpdatePayload(input);
        const rawComposition = parseJsonArrayField<CompositionInputItem>(
          input.compositionJson,
          "ingredients",
        );
        const rawEtapes = parseJsonArrayField<EtapeInputItem>(
          input.etapesJson,
          "etapes",
        );

        const compositionItems = rawComposition
          ? normalizeCompositionItems(rawComposition)
          : undefined;
        const etapesItems = rawEtapes
          ? normalizeEtapesItems(rawEtapes)
          : undefined;

        if (!compositionItems || compositionItems.length === 0) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Ajoutez au moins un ingredient.",
          });
        }

        if (!etapesItems || etapesItems.length === 0) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Ajoutez au moins une etape.",
          });
        }

        if (
          Object.keys(payload).length === 0 &&
          compositionItems === undefined &&
          etapesItems === undefined
        ) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Aucune modification a enregistrer.",
          });
        }

        if (Object.keys(payload).length > 0) {
          await context.locals.pb
            .collection("recettes")
            .update(input.recetteId, payload);
        }

        if (compositionItems !== undefined) {
          const existingComposition = await context.locals.pb
            .collection("composition")
            .getFullList({ filter: `recette="${input.recetteId}"` });

          await Promise.all(
            existingComposition.map((item) =>
              context.locals.pb.collection("composition").delete(item.id),
            ),
          );

          for (const item of compositionItems) {
            await context.locals.pb.collection("composition").create({
              recette: input.recetteId,
              ingredient: item.ingredientId,
              quantite: item.quantite,
              unite: item.unite || undefined,
            });
          }
        }

        if (etapesItems !== undefined) {
          const existingEtapes = await context.locals.pb
            .collection("etapes")
            .getFullList({ filter: `recette="${input.recetteId}"` });

          await Promise.all(
            existingEtapes.map((item) =>
              context.locals.pb.collection("etapes").delete(item.id),
            ),
          );

          for (const [index, item] of etapesItems.entries()) {
            await context.locals.pb.collection("etapes").create({
              recette: input.recetteId,
              numero_ordre: index + 1,
              titre: item.titre,
              description: item.description,
            });
          }
        }

        return {
          success: true,
          redirectTo:
            sanitizeReturnTo(input.returnTo || "/profil") + "?recette=updated",
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        const pbFieldMessage = getPbFirstFieldMessage(error, [
          "image",
          "slug",
          "titre",
          "regimes",
          "categorie",
          "objectif_sante",
          "ingredient",
          "recette",
          "unite",
          "quantite",
          "numero_ordre",
          "description",
          "compositionJson",
          "etapesJson",
          "user",
        ]);

        if (pbFieldMessage) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: pbFieldMessage,
          });
        }

        const pbMessage = getPbErrorMessage(error);

        if (pbMessage) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: pbMessage,
          });
        }

        const pbStatus = getPbErrorStatus(error);

        if (typeof pbStatus === "number" && pbStatus >= 400 && pbStatus < 500) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message:
              "Certaines donnees de la recette sont invalides. Verifiez l'image, les ingredients et les etapes.",
          });
        }

        console.error(
          "[actions.updateRecette] Impossible de modifier la recette",
          formatErrorForLog(error),
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de modifier cette recette pour le moment.",
        });
      }
    },
  }),

  deleteRecette: defineAction({
    accept: "form",
    input: deleteRecetteSchema,
    handler: async (input, context) => {
      const userId = ensureAuthenticatedUserId(context);

      try {
        const existingRecette = await context.locals.pb
          .collection("recettes")
          .getOne(input.recetteId);

        if (existingRecette.user !== userId) {
          throw new ActionError({
            code: "FORBIDDEN",
            message: "Vous ne pouvez supprimer que vos propres recettes.",
          });
        }

        await context.locals.pb.collection("recettes").delete(input.recetteId);

        return {
          success: true,
          redirectTo:
            sanitizeReturnTo(input.returnTo || "/profil") + "?recette=deleted",
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error(
          "[actions.deleteRecette] Impossible de supprimer la recette",
          error,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de supprimer cette recette pour le moment.",
        });
      }
    },
  }),
};
