import type { RecettesResponse, TypedPocketBase } from "../../pocketbase-types";

export interface LatestRecettesResult {
  recettes: RecettesResponse[];
  fetchError: boolean;
}

export async function getLatestRecettes(
  pb: TypedPocketBase,
  limit = 4,
): Promise<LatestRecettesResult> {
  try {
    const recettesPage = await pb.collection("recettes").getList(1, limit, {
      sort: "-created",
    });

    return {
      recettes: recettesPage.items,
      fetchError: false,
    };
  } catch (error) {
    console.error(
      "[recettes.service] Impossible de recuperer les recettes PocketBase",
      error,
    );
    return {
      recettes: [],
      fetchError: true,
    };
  }
}
