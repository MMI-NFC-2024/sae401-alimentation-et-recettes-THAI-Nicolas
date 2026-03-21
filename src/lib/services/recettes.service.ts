import type { RecettesResponse, TypedPocketBase } from "../../pocketbase-types";

export interface RecettesCollection {
  recettes: RecettesResponse[];
  fetchError: boolean;
}

export async function getLatestRecettes(
  pb: TypedPocketBase,
  limit = 4,
): Promise<RecettesCollection> {
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

export async function getAllRecettes(
  pb: TypedPocketBase,
): Promise<RecettesCollection> {
  try {
    const recettesPage = await pb.collection("recettes").getFullList({
      sort: "-created",
    });
    return {
      recettes: recettesPage,
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

export async function getRecetteBySlug(
  pb: TypedPocketBase,
  slug: string,
): Promise<RecettesCollection> {
  try {
    const recette = await pb.collection("recettes").getOne(slug);
    return {
      recettes: [recette],
      fetchError: false,
    };
  } catch (error) {
    console.error(
      "[recettes.service] Impossible de recuperer la recette PocketBase",
      error,
    );
    return {
      recettes: [],
      fetchError: true,
    };
  }
}
