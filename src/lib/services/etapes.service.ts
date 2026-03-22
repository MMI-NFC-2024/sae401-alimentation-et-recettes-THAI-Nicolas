import type { EtapesResponse, TypedPocketBase } from "../../pocketbase-types";

export type ServiceError = "not_found" | "server_error";

export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}

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
