import type {
  IngredientsResponse,
  TypedPocketBase,
} from "../../pocketbase-types";
import type { ServiceResult } from "../types/service";

// Récupère tous les ingrédients disponibles (triés par catégorie puis nom)
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
