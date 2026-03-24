import type { EtapesResponse, TypedPocketBase } from "../../pocketbase-types";
import type { ServiceResult } from "../types/service";

// Récupère les étapes d'une recette donnée (triées par numero_ordre)
export async function getEtapesByRecetteId(
  pb: TypedPocketBase,
  recetteId: string,
): Promise<ServiceResult<EtapesResponse[]>> {
  try {
    const etapes = await pb.collection("etapes").getFullList({
      sort: "numero_ordre",
      filter: `recette="${recetteId}"`,
    });

    return {
      data: etapes,
      error: null,
    };
  } catch (error) {
    console.error(
      "[etapes.service] Impossible de recuperer les etapes PocketBase",
      error,
    );

    return { data: [], error: "server_error" };
  }
}
