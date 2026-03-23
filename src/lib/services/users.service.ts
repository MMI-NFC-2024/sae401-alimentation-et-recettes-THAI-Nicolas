import type { TypedPocketBase, UsersResponse } from "../../pocketbase-types";

export type ServiceError = "not_found" | "server_error";

export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}

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
