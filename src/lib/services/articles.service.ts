import type { ArticlesResponse, TypedPocketBase } from "../../pocketbase-types";

export interface LatestArticlesResult {
  articles: ArticlesResponse[];
  fetchError: boolean;
}

export async function getLatestArticles(
  pb: TypedPocketBase,
  limit = 3,
): Promise<LatestArticlesResult> {
  try {
    const articlesPage = await pb.collection("articles").getList(1, limit, {
      sort: "-created",
    });

    return {
      articles: articlesPage.items,
      fetchError: false,
    };
  } catch (error) {
    console.error(
      "[articles.service] Impossible de recuperer les articles PocketBase",
      error,
    );

    return {
      articles: [],
      fetchError: true,
    };
  }
}
