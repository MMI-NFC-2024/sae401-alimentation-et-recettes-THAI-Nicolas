import type { ArticlesResponse, TypedPocketBase } from "../../pocketbase-types";
import type { ServiceResult } from "../types/service";

//Récupère les derniers articles, avec une limite optionnelle (par défaut 3)
export async function getLatestArticles(
  pb: TypedPocketBase,
  limit = 3,
): Promise<ServiceResult<ArticlesResponse[]>> {
  try {
    const articlesPage = await pb.collection("articles").getList(1, limit, {
      sort: "-created",
    });

    return {
      data: articlesPage.items,
      error: null,
    };
  } catch (error) {
    console.error(
      "[articles.service] Impossible de recuperer les articles PocketBase",
      error,
    );

    return {
      data: [],
      error: "server_error",
    };
  }
}

//Récupère tous les articles sans limite, triés par date de création décroissante
export async function getAllArticles(
  pb: TypedPocketBase,
): Promise<ServiceResult<ArticlesResponse[]>> {
  try {
    const articlesPage = await pb.collection("articles").getFullList({
      sort: "-created",
    });

    return {
      data: articlesPage,
      error: null,
    };
  } catch (error) {
    console.error(
      "[articles.service] Impossible de recuperer les articles PocketBase",
      error,
    );

    return {
      data: [],
      error: "server_error",
    };
  }
}

//Récupère un article par son slug, retourne une erreur "not_found" si l'article n'existe pas
export async function getArticleBySlug(
  pb: TypedPocketBase,
  slug: string,
): Promise<ServiceResult<ArticlesResponse | null>> {
  try {
    const article = await pb
      .collection("articles")
      .getFirstListItem(`slug="${slug}"`);
    return {
      data: article,
      error: null,
    };
  } catch (error: any) {
    if (error?.status === 404) {
      return {
        data: null,
        error: "not_found",
      };
    }

    console.error(
      "[articles.service] Impossible de recuperer l'article PocketBase",
      error,
    );

    return {
      data: null,
      error: "server_error",
    };
  }
}
