import type { APIRoute } from "astro";
import { handleOAuthStart } from "../../../lib/utils/oauth";

export const GET: APIRoute = async (context) => {
  const provider = context.params.provider;
  return handleOAuthStart(context, provider);
};
