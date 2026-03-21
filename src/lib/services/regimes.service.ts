import type { RegimesResponse, TypedPocketBase } from "../../pocketbase-types";

export interface RegimesCollection {
  regimes: RegimesResponse[];
  fetchError: boolean;
}

export interface RegimeOption {
  id: string;
  name: string;
}

export async function getAllRegimes(
  pb: TypedPocketBase,
): Promise<RegimesCollection> {
  try {
    const regimes = await pb.collection("regimes").getFullList({
      sort: "nom",
    });

    return {
      regimes,
      fetchError: false,
    };
  } catch (error) {
    console.error(
      "[regimes.service] Impossible de recuperer les regimes PocketBase",
      error,
    );

    return {
      regimes: [],
      fetchError: true,
    };
  }
}

export async function getRegimeOptions(
  pb: TypedPocketBase,
): Promise<RegimeOption[]> {
  const { regimes } = await getAllRegimes(pb);

  return regimes.map((regime) => ({
    id: regime.id,
    name: regime.nom ?? "Regime",
  }));
}
