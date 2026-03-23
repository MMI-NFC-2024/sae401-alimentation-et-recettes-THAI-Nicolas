import type { APIContext } from "astro";

export const OAUTH_ALLOWED_PROVIDERS = ["google", "facebook"] as const;

export type OAuthProvider = (typeof OAUTH_ALLOWED_PROVIDERS)[number];

interface OAuth2ProviderConfig {
  name?: string;
  codeVerifier?: string;
  state?: string;
  authUrl?: string;
  authURL?: string;
}

interface AuthMethodsShape {
  oauth2?: {
    providers?: OAuth2ProviderConfig[];
  };
  authProviders?: OAuth2ProviderConfig[];
}

function sanitizeReturnTo(returnTo: string | null | undefined): string {
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }

  return "/";
}

function buildOAuthLoginErrorRedirect(
  provider: string,
  reason: string,
  returnTo?: string,
) {
  const params = new URLSearchParams({
    oauthError: reason,
    provider,
  });

  if (returnTo) {
    params.set("returnTo", sanitizeReturnTo(returnTo));
  }

  return `/auth/login?${params.toString()}`;
}

function getCookieNames(provider: OAuthProvider) {
  return {
    state: `slurpy_oauth_${provider}_state`,
    verifier: `slurpy_oauth_${provider}_verifier`,
    returnTo: `slurpy_oauth_${provider}_return_to`,
  };
}

function isAllowedProvider(value: string | undefined): value is OAuthProvider {
  if (!value) return false;
  return (OAUTH_ALLOWED_PROVIDERS as readonly string[]).includes(value);
}

function getProviderConfig(
  methods: AuthMethodsShape,
  provider: OAuthProvider,
): OAuth2ProviderConfig | undefined {
  const providers = methods.oauth2?.providers ?? methods.authProviders ?? [];
  return providers.find((item) => item.name === provider);
}

function getPb(context: APIContext) {
  const locals = context.locals as {
    pb?: {
      collection: (name: string) => {
        listAuthMethods: () => Promise<AuthMethodsShape>;
        authWithOAuth2Code: (
          provider: string,
          code: string,
          codeVerifier: string,
          redirectUrl: string,
        ) => Promise<unknown>;
      };
    };
  };

  return locals.pb;
}

export async function handleOAuthStart(
  context: APIContext,
  providerParam: string | undefined,
) {
  const provider = isAllowedProvider(providerParam) ? providerParam : undefined;

  if (!provider) {
    return context.redirect(
      buildOAuthLoginErrorRedirect("unknown", "provider_not_allowed"),
    );
  }

  const pb = getPb(context);
  if (!pb) {
    return context.redirect(
      buildOAuthLoginErrorRedirect(provider, "pb_unavailable"),
    );
  }

  try {
    const url = new URL(context.request.url);
    const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo"));
    const callbackUrl = new URL(
      `/auth/oauth/${provider}/callback`,
      url,
    ).toString();

    const methods = await pb.collection("users").listAuthMethods();
    const providerConfig = getProviderConfig(methods, provider);
    const authUrl = providerConfig?.authUrl ?? providerConfig?.authURL;

    if (
      !providerConfig ||
      !providerConfig.codeVerifier ||
      !providerConfig.state ||
      !authUrl
    ) {
      return context.redirect(
        buildOAuthLoginErrorRedirect(
          provider,
          "provider_not_configured",
          returnTo,
        ),
      );
    }

    const names = getCookieNames(provider);
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: url.protocol === "https:",
      maxAge: 10 * 60,
    };

    context.cookies.set(names.state, providerConfig.state, cookieOptions);
    context.cookies.set(
      names.verifier,
      providerConfig.codeVerifier,
      cookieOptions,
    );
    context.cookies.set(names.returnTo, returnTo, cookieOptions);

    return context.redirect(`${authUrl}${encodeURIComponent(callbackUrl)}`);
  } catch {
    return context.redirect(
      buildOAuthLoginErrorRedirect(provider, "oauth_start_failed"),
    );
  }
}

export async function handleOAuthCallback(
  context: APIContext,
  providerParam: string | undefined,
) {
  const provider = isAllowedProvider(providerParam) ? providerParam : undefined;

  if (!provider) {
    return context.redirect(
      buildOAuthLoginErrorRedirect("unknown", "provider_not_allowed"),
    );
  }

  const pb = getPb(context);
  if (!pb) {
    return context.redirect(
      buildOAuthLoginErrorRedirect(provider, "pb_unavailable"),
    );
  }

  const url = new URL(context.request.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";

  const names = getCookieNames(provider);
  const expectedState = context.cookies.get(names.state)?.value;
  const codeVerifier = context.cookies.get(names.verifier)?.value;
  const returnTo = sanitizeReturnTo(context.cookies.get(names.returnTo)?.value);
  const callbackUrl = new URL(
    `/auth/oauth/${provider}/callback`,
    url,
  ).toString();

  context.cookies.delete(names.state, { path: "/" });
  context.cookies.delete(names.verifier, { path: "/" });
  context.cookies.delete(names.returnTo, { path: "/" });

  if (
    !code ||
    !state ||
    !expectedState ||
    !codeVerifier ||
    state !== expectedState
  ) {
    return context.redirect(
      buildOAuthLoginErrorRedirect(provider, "invalid_callback", returnTo),
    );
  }

  try {
    await pb
      .collection("users")
      .authWithOAuth2Code(provider, code, codeVerifier, callbackUrl);

    return context.redirect(returnTo);
  } catch {
    return context.redirect(
      buildOAuthLoginErrorRedirect(provider, "oauth_exchange_failed", returnTo),
    );
  }
}
