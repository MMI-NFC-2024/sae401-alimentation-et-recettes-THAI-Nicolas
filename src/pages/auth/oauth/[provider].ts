// Route pour déparrer le flux d'authentification OAuth : redirige vers la page d'auth du provider avec les bons paramètres
import type { APIRoute } from "astro";
import { handleOAuthStart } from "../../../lib/utils/oauth";

export const GET: APIRoute = async (context) => {
  const provider = context.params.provider;
  return handleOAuthStart(context, provider);
};
