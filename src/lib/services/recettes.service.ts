import type {
  RecettesCategorieOptions,
  RecettesObjectifSanteOptions,
  RecettesResponse,
  RegimesResponse,
  TypedPocketBase,
  UsersResponse,
} from "../../pocketbase-types";

export type ServiceError = "not_found" | "server_error";

export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}

export interface GetLatestRecettesFilters {
  objectif_sante?: RecettesObjectifSanteOptions;
  categorie?: RecettesCategorieOptions;
  exclude_id?: string;
}

export type RecetteBySlugResponse = RecettesResponse<{
  user?: UsersResponse;
  regimes?: RegimesResponse[];
}>;

export async function getLatestRecettes(
  pb: TypedPocketBase,
  limit = 4,
  filters?: GetLatestRecettesFilters,
): Promise<ServiceResult<RecettesResponse[]>> {
  try {
    const filterRules: string[] = [];

    if (filters?.objectif_sante) {
      filterRules.push(`objectif_sante="${filters.objectif_sante}"`);
    }

    if (filters?.categorie) {
      filterRules.push(`categorie="${filters.categorie}"`);
    }

    if (filters?.exclude_id) {
      filterRules.push(`id!="${filters.exclude_id}"`);
    }

    const recettesPage = await pb.collection("recettes").getList(1, limit, {
      sort: "-created",
      expand: "user",
      filter: filterRules.length > 0 ? filterRules.join(" && ") : undefined,
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
): Promise<ServiceResult<RecetteBySlugResponse | null>> {
  try {
    const recette = await pb
      .collection("recettes")
      .getFirstListItem(`slug="${slug}"`, { expand: "user, regimes" });

    return { data: recette as RecetteBySlugResponse, error: null };
  } catch (error: any) {
    if (error?.status === 404) {
      return { data: null, error: "not_found" };
    }

    return { data: null, error: "server_error" };
  }
}
