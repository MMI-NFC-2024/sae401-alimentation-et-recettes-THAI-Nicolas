import type { APIRoute } from "astro";
import { handleOAuthCallback } from "../../../../lib/utils/oauth";

export const GET: APIRoute = async (context) => {
  const provider = context.params.provider;
  return handleOAuthCallback(context, provider);
};
