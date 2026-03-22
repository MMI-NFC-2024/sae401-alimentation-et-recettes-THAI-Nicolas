import type {
  AvisResponse,
  TypedPocketBase,
  UsersResponse,
} from "../../pocketbase-types";

export type ServiceError = "server_error";

export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}

export type AvisWithUserResponse = AvisResponse<{
  user?: UsersResponse;
}>;

export interface AvisStats {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface AvisCardStats {
  average: number;
  total: number;
}

async function hydrateAvisUsers(
  pb: TypedPocketBase,
  avis: AvisWithUserResponse[],
): Promise<AvisWithUserResponse[]> {
  try {
    const userIds = Array.from(
      new Set(
        avis
          .filter((item) => !item.expand?.user && item.user)
          .map((item) => item.user as string),
      ),
    );

    if (userIds.length === 0) {
      return avis;
    }

    const users = (await pb.collection("users").getFullList({
      filter: userIds.map((id) => `id=\"${id}\"`).join(" || "),
    })) as UsersResponse[];

    const usersById = new Map(users.map((user) => [user.id, user]));

    return avis.map((item) => {
      if (item.expand?.user) {
        return item;
      }

      const userId = item.user;
      if (!userId) {
        return item;
      }

      const user = usersById.get(userId);
      if (!user) {
        return item;
      }

      return {
        ...item,
        expand: {
          ...(item.expand ?? {}),
          user,
        },
      };
    });
  } catch {
    // If users cannot be fetched, keep current payload (reviews still visible).
    return avis;
  }
}

function computeAvisStats(avis: AvisWithUserResponse[]): AvisStats {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let totalScore = 0;

  for (const item of avis) {
    const note = Number(item.note ?? 0);
    if (note >= 1 && note <= 5) {
      const rounded = Math.round(note) as 1 | 2 | 3 | 4 | 5;
      distribution[rounded] += 1;
      totalScore += note;
    }
  }

  const total = avis.length;
  const average = total > 0 ? Number((totalScore / total).toFixed(1)) : 0;

  return { average, total, distribution };
}

export async function getAvisByRecetteId(
  pb: TypedPocketBase,
  recetteId: string,
): Promise<ServiceResult<AvisWithUserResponse[]>> {
  try {
    let avis: AvisWithUserResponse[] = [];

    try {
      avis = (await pb.collection("avis").getFullList({
        filter: `recette="${recetteId}"`,
        sort: "-created",
        expand: "user",
      })) as AvisWithUserResponse[];
    } catch {
      // Fallback: if user expansion is blocked, still return comments.
      avis = (await pb.collection("avis").getFullList({
        filter: `recette="${recetteId}"`,
        sort: "-created",
      })) as AvisWithUserResponse[];
    }

    const avisWithUsers = await hydrateAvisUsers(pb, avis);

    return {
      data: avisWithUsers,
      error: null,
    };
  } catch (error) {
    console.error(
      "[avis.service] Impossible de recuperer les avis PocketBase",
      error,
    );
    return { data: [], error: "server_error" };
  }
}

export async function getAvisStatsByRecetteId(
  pb: TypedPocketBase,
  recetteId: string,
): Promise<ServiceResult<AvisStats>> {
  try {
    const avis = await pb.collection("avis").getFullList({
      filter: `recette="${recetteId}"`,
    });

    return {
      data: computeAvisStats(avis as AvisWithUserResponse[]),
      error: null,
    };
  } catch (error) {
    console.error(
      "[avis.service] Impossible de recuperer les statistiques des avis PocketBase",
      error,
    );

    return {
      data: {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      error: "server_error",
    };
  }
}

export async function getAvisStatsByRecetteIds(
  pb: TypedPocketBase,
  recetteIds: string[],
): Promise<ServiceResult<Record<string, AvisCardStats>>> {
  try {
    const uniqueRecetteIds = Array.from(new Set(recetteIds.filter(Boolean)));
    if (uniqueRecetteIds.length === 0) {
      return { data: {}, error: null };
    }

    const chunkSize = 20;
    const statsByRecette: Record<string, { sum: number; total: number }> = {};

    uniqueRecetteIds.forEach((id) => {
      statsByRecette[id] = { sum: 0, total: 0 };
    });

    for (let i = 0; i < uniqueRecetteIds.length; i += chunkSize) {
      const chunk = uniqueRecetteIds.slice(i, i + chunkSize);
      const filter = chunk.map((id) => `recette=\"${id}\"`).join(" || ");

      const avisChunk = (await pb.collection("avis").getFullList({
        filter,
      })) as AvisResponse[];

      for (const avis of avisChunk) {
        const recette = avis.recette;
        if (!recette || !statsByRecette[recette]) {
          continue;
        }

        const note = Number(avis.note ?? 0);
        statsByRecette[recette].total += 1;
        if (Number.isFinite(note) && note >= 1 && note <= 5) {
          statsByRecette[recette].sum += note;
        }
      }
    }

    const normalizedStats: Record<string, AvisCardStats> = {};
    uniqueRecetteIds.forEach((id) => {
      const entry = statsByRecette[id] ?? { sum: 0, total: 0 };
      normalizedStats[id] = {
        average:
          entry.total > 0 ? Number((entry.sum / entry.total).toFixed(1)) : 0,
        total: entry.total,
      };
    });

    return { data: normalizedStats, error: null };
  } catch (error) {
    console.error(
      "[avis.service] Impossible de recuperer les statistiques par recette",
      error,
    );
    return { data: {}, error: "server_error" };
  }
}
