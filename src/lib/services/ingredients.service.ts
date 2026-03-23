import type {
  IngredientsResponse,
  TypedPocketBase,
} from "../../pocketbase-types";

export type ServiceError = "server_error";

export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}

export async function getAllIngredients(
  pb: TypedPocketBase,
): Promise<ServiceResult<IngredientsResponse[]>> {
  try {
    const ingredients = await pb.collection("ingredients").getFullList({
      sort: "categorie,nom",
    });

    return {
      data: ingredients,
      error: null,
    };
  } catch (error) {
    console.error(
      "[ingredients.service] Impossible de recuperer les ingredients PocketBase",
      error,
    );

    return {
      data: [],
      error: "server_error",
    };
  }
}
