import type { ArticlesResponse, TypedPocketBase } from "../../pocketbase-types";

export type ServiceError = "not_found" | "server_error";

export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}

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
