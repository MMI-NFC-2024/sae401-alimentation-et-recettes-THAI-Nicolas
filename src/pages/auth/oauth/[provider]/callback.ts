//Gère le retour du provider OAuth après que l'utilisateur se soit authentifié : vérifie les paramètres,
// valide la connexion avec PocketBase et redirige vers la page d'accueil ou la page de retour spécifiée

import type { APIRoute } from "astro";
import { handleOAuthCallback } from "../../../../lib/utils/oauth";

export const GET: APIRoute = async (context) => {
  const provider = context.params.provider;
  return handleOAuthCallback(context, provider);
};
