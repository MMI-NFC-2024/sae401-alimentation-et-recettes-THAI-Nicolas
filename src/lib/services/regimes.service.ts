import type { RegimesResponse, TypedPocketBase } from "../../pocketbase-types";
import type { ServiceResult } from "../types/service";

export interface RegimeOption {
  id: string;
  name: string;
}

// Récupère tous les régimes disponibles (triés par nom)
export async function getAllRegimes(
  pb: TypedPocketBase,
): Promise<ServiceResult<RegimesResponse[]>> {
  try {
    const regimes = await pb.collection("regimes").getFullList({
      sort: "nom",
    });

    return {
      data: regimes,
      error: null,
    };
  } catch (error) {
    console.error(
      "[regimes.service] Impossible de recuperer les regimes PocketBase",
      error,
    );

    return {
      data: [],
      error: "server_error",
    };
  }
}

// Récupère les options de régimes pour les formulaires (id et nom)
export async function getRegimeOptions(
  pb: TypedPocketBase,
): Promise<ServiceResult<RegimeOption[]>> {
  const { data: regimes, error } = await getAllRegimes(pb);

  if (error) {
    return {
      data: [],
      error,
    };
  }

  return {
    data: regimes.map((regime) => ({
      id: regime.id,
      name: regime.nom ?? "Regime",
    })),
    error: null,
  };
}
