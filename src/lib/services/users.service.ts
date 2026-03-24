import type { TypedPocketBase, UsersResponse } from "../../pocketbase-types";
import type { ServiceResult } from "../types/service";

export type UserProfileResponse = UsersResponse & {
  objectif_sante?: string;
};

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
