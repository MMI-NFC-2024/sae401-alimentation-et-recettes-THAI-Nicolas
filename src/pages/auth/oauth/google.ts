import type { APIRoute } from "astro";

const STATE_COOKIE = "slurpy_oauth_google_state";
const VERIFIER_COOKIE = "slurpy_oauth_google_verifier";
const RETURN_TO_COOKIE = "slurpy_oauth_google_return_to";

function sanitizeReturnTo(returnTo: string | null): string {
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }

  return "/";
}

export const GET: APIRoute = async ({ locals, request, cookies, redirect }) => {
  try {
    const url = new URL(request.url);
    const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo"));
    const callbackUrl = new URL("/auth/oauth/google/callback", url).toString();

    const methods = (await locals.pb.collection("users").listAuthMethods()) as {
      oauth2?: {
        providers?: Array<{
          name?: string;
          codeVerifier?: string;
          state?: string;
          authUrl?: string;
          authURL?: string;
        }>;
      };
      authProviders?: Array<{
        name?: string;
        codeVerifier?: string;
        state?: string;
        authUrl?: string;
        authURL?: string;
      }>;
    };

    const providers = methods.oauth2?.providers ?? methods.authProviders ?? [];
    const provider = providers.find((item) => item.name === "google");

    const authUrl =
      (provider as { authUrl?: string; authURL?: string } | undefined)
        ?.authUrl ??
      (provider as { authUrl?: string; authURL?: string } | undefined)?.authURL;

    if (!provider || !provider.codeVerifier || !provider.state || !authUrl) {
      return redirect("/auth/login");
    }

    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: url.protocol === "https:",
      maxAge: 10 * 60,
    };

    cookies.set(STATE_COOKIE, provider.state, cookieOptions);
    cookies.set(VERIFIER_COOKIE, provider.codeVerifier, cookieOptions);
    cookies.set(RETURN_TO_COOKIE, returnTo, cookieOptions);

    return redirect(`${authUrl}${encodeURIComponent(callbackUrl)}`);
  } catch {
    return redirect("/auth/login");
  }
};
