import type {
  CompositionResponse,
  IngredientsResponse,
  TypedPocketBase,
} from "../../pocketbase-types";
import type { ServiceResult } from "../types/service";

export type CompositionWithIngredientResponse = CompositionResponse<{
  ingredient?: IngredientsResponse;
}>;

// Récupère la composition d'une recette donnée (expand sur les ingredients)
export async function getCompositionByRecetteId(
  pb: TypedPocketBase,
  recetteId: string,
): Promise<ServiceResult<CompositionWithIngredientResponse[]>> {
  try {
    const composition = await pb.collection("composition").getFullList({
      filter: `recette="${recetteId}"`,
      sort: "created",
      expand: "ingredient",
    });

    return {
      data: composition as CompositionWithIngredientResponse[],
      error: null,
    };
  } catch (error) {
    console.error(
      "[composition.service] Impossible de recuperer la composition PocketBase",
      error,
    );

    return { data: [], error: "server_error" };
  }
}
