import type { ArticlesResponse, TypedPocketBase } from "../../pocketbase-types";

export interface ArticlesCollection {
  articles: ArticlesResponse[];
  fetchError: boolean;
}

export async function getLatestArticles(
  pb: TypedPocketBase,
  limit = 3,
): Promise<ArticlesCollection> {
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

export async function getAllArticles(
  pb: TypedPocketBase,
): Promise<ArticlesCollection> {
  try {
    const articlesPage = await pb.collection("articles").getList(1, 100, {
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

export async function getArticleBySlug(
  pb: TypedPocketBase,
  slug: string,
): Promise<ArticlesCollection> {
  try {
    const articlesPage = await pb.collection("articles").getOne(slug);
    return {
      articles: [articlesPage],
      fetchError: false,
    };
  } catch (error) {
    console.error(
      "[articles.service] Impossible de recuperer l'article PocketBase",
      error,
    );

    return {
      articles: [],
      fetchError: true,
    };
  }
}

// export async function getArticlesByType(
//   pb: TypedPocketBase,
//   type: string,
// ): Promise<ArticlesCollection> {
//   try {
//     const articlesPage = await pb.collection("articles").getFullList({
//       sort: "-created",
//       filter: `type="${type}"`,
//     });
//     return {
//       articles: articlesPage,
//       fetchError: false,
//     };
//   } catch (error) {
//     console.error(
//       "[articles.service] Impossible de recuperer les articles PocketBase par type",
//       error,
//     );
//     return {
//       articles: [],
//       fetchError: true,
//     };
//   }
// }

// export async function getArticlesByTitle(
//   pb: TypedPocketBase,
//   title: string,
// ): Promise<ArticlesCollection> {
//   try {
//     const articlesPage = await pb.collection("articles").getFullList({
//       sort: "-created",
//       filter: `titre="${title}"`,
//     });
//     return {
//       articles: articlesPage,
//       fetchError: false,
//     };
//   } catch (error) {
//     console.error(
//       "[articles.service] Impossible de recuperer l'article PocketBase par titre",
//       error,
//     );
//     return {
//       articles: [],
//       fetchError: true,
//     };
//   }
// }
