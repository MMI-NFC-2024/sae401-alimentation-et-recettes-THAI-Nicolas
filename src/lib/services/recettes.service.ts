import type { RecettesResponse, TypedPocketBase } from "../../pocketbase-types";

export type ServiceError = "not_found" | "server_error";

export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}

export async function getLatestRecettes(
  pb: TypedPocketBase,
  limit = 4,
): Promise<ServiceResult<RecettesResponse[]>> {
  try {
    const recettesPage = await pb.collection("recettes").getList(1, limit, {
      sort: "-created",
      expand: "user",
    });

    return {
      data: recettesPage.items,
      error: null,
    };
  } catch (error) {
    console.error(
      "[recettes.service] Impossible de recuperer les recettes PocketBase",
      error,
    );
    return {
      data: [],
      error: "server_error",
    };
  }
}

export async function getAllRecettes(
  pb: TypedPocketBase,
): Promise<ServiceResult<RecettesResponse[]>> {
  try {
    const recettesPage = await pb.collection("recettes").getFullList({
      sort: "-created",
      expand: "user",
    });
    return {
      data: recettesPage,
      error: null,
    };
  } catch (error) {
    console.error(
      "[recettes.service] Impossible de recuperer les recettes PocketBase",
      error,
    );
    return {
      data: [],
      error: "server_error",
    };
  }
}

export async function getRecetteBySlug(
  pb: TypedPocketBase,
  slug: string,
): Promise<ServiceResult<RecettesResponse | null>> {
  try {
    const recette = await pb
      .collection("recettes")
      .getFirstListItem(`slug="${slug}"`, { expand: "user" });

    return { data: recette, error: null };
  } catch (error: any) {
    if (error?.status === 404) {
      return { data: null, error: "not_found" };
    }

    return { data: null, error: "server_error" };
  }
}
