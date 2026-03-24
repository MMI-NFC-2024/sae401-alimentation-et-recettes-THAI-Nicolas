// Route pour déconnecter l'utilisateur en POST, pour éviter les déconnexions par erreur

import type { APIRoute } from "astro";

//Route POST pour se déconnecter : on efface les données d'authentification de PocketBase et on redirige vers la page d'accueil
export const POST: APIRoute = async ({ locals, redirect }) => {
  locals.pb.authStore.clear();
  return redirect("/");
};

//Protection de la route GET pour éviter que les utilisateurs accèdent à cette page via une requête GET (ex: en tapant l'URL dans la barre d'adresse).
export const GET: APIRoute = async ({ redirect }) => {
  return redirect("/auth/login");
};
