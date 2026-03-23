import type { APIRoute } from "astro";

const STATE_COOKIE = "slurpy_oauth_google_state";
const VERIFIER_COOKIE = "slurpy_oauth_google_verifier";
const RETURN_TO_COOKIE = "slurpy_oauth_google_return_to";

function sanitizeReturnTo(returnTo: string | undefined): string {
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }

  return "/";
}

export const GET: APIRoute = async ({ locals, request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";

  const expectedState = cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = cookies.get(VERIFIER_COOKIE)?.value;
  const returnTo = sanitizeReturnTo(cookies.get(RETURN_TO_COOKIE)?.value);
  const callbackUrl = new URL("/auth/oauth/google/callback", url).toString();

  cookies.delete(STATE_COOKIE, { path: "/" });
  cookies.delete(VERIFIER_COOKIE, { path: "/" });
  cookies.delete(RETURN_TO_COOKIE, { path: "/" });

  if (
    !code ||
    !state ||
    !expectedState ||
    !codeVerifier ||
    state !== expectedState
  ) {
    return redirect("/auth/login");
  }

  try {
    await locals.pb
      .collection("users")
      .authWithOAuth2Code("google", code, codeVerifier, callbackUrl);

    return redirect(returnTo);
  } catch {
    return redirect("/auth/login");
  }
};
