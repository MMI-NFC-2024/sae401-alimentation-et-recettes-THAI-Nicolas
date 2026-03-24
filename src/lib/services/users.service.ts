import type { TypedPocketBase, UsersResponse } from "../../pocketbase-types";
import type { ServiceResult } from "../types/service";

export type UserProfileResponse = UsersResponse & {
  objectif_sante?: string;
};

export interface UpdateUserProfileInput {
  name?: string;
  bio?: string;
  age?: number;
  objectif_sante?: string;
  avatar?: File;
}

// Fonction qui nettoie les données d'entrée pour la mise à jour du profil utilisateur (ne garde que les champs valides et non vides, pour éviter d'injecter un champs via le navigateur)
function sanitizeUpdatePayload(input: UpdateUserProfileInput) {
  const payload: Record<string, unknown> = {};

  if (typeof input.name === "string") {
    payload.name = input.name;
  }

  if (typeof input.bio === "string") {
    payload.bio = input.bio;
  }

  if (typeof input.age === "number") {
    payload.age = input.age;
  }

  if (typeof input.objectif_sante === "string") {
    payload.objectif_sante = input.objectif_sante;
  }

  if (input.avatar instanceof File && input.avatar.size > 0) {
    payload.avatar = input.avatar;
  }

  return payload;
}

// Récupère les données d'un utilisateur par son ID
export async function getUserById(
  pb: TypedPocketBase,
  userId: string,
): Promise<ServiceResult<UserProfileResponse | null>> {
  try {
    const user = await pb.collection("users").getOne(userId);
    return {
      data: user as UserProfileResponse,
      error: null,
    };
  } catch (error: any) {
    if (error?.status === 404) {
      return {
        data: null,
        error: "not_found",
      };
    }

    console.error(
      "[users.service] Impossible de recuperer l'utilisateur",
      error,
    );
    return {
      data: null,
      error: "server_error",
    };
  }
}

// Récupère les données de l'utilisateur actuellement connecté (retourne une erreur "not_found" si aucun utilisateur n'est connecté)
export async function getCurrentUserProfile(
  pb: TypedPocketBase,
): Promise<ServiceResult<UserProfileResponse | null>> {
  const authModel = pb.authStore.model as { id?: string } | null;
  const userId = authModel?.id;

  if (!userId) {
    return {
      data: null,
      error: "not_found",
    };
  }

  return getUserById(pb, userId);
}

// Met à jour le profil de l'utilisateur donné avec les données d'entrée fournies, retourne une erreur "not_found" si l'utilisateur n'existe pas
export async function updateUserProfile(
  pb: TypedPocketBase,
  userId: string,
  input: UpdateUserProfileInput,
): Promise<ServiceResult<UserProfileResponse | null>> {
  try {
    const payload = sanitizeUpdatePayload(input);
    const updatedUser = await pb.collection("users").update(userId, payload);

    return {
      data: updatedUser as UserProfileResponse,
      error: null,
    };
  } catch (error: any) {
    if (error?.status === 404) {
      return {
        data: null,
        error: "not_found",
      };
    }

    console.error(
      "[users.service] Impossible de mettre a jour le profil",
      error,
    );
    return {
      data: null,
      error: "server_error",
    };
  }
}
