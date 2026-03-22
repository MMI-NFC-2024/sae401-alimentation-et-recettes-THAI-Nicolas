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
    const avis = await pb.collection("avis").getFullList({
      filter: `recette="${recetteId}"`,
      sort: "-created",
      expand: "user",
    });

    return {
      data: avis as AvisWithUserResponse[],
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
  const avisResult = await getAvisByRecetteId(pb, recetteId);

  if (avisResult.error) {
    return {
      data: {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      error: avisResult.error,
    };
  }

  return {
    data: computeAvisStats(avisResult.data),
    error: null,
  };
}
