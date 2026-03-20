import { ActionError, defineAction } from "astro:actions";
import { sendContactEmail } from "../lib/services/emailjs.service";
import { contactFormSchema, newsletterSchema } from "../schemas/contact.schema";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

// Rate-limit volontairement simple (petit site): 5 envois / 10 min / IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestsByIp = new Map<string, number[]>();

function assertWithinRateLimit(ipAddress: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const currentAttempts = requestsByIp.get(ipAddress) ?? [];

  const recentAttempts = currentAttempts.filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw new ActionError({
      code: "TOO_MANY_REQUESTS",
      message: "Trop de tentatives. Merci de reessayer dans quelques minutes.",
    });
  }

  recentAttempts.push(now);
  requestsByIp.set(ipAddress, recentAttempts);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sanitizeReturnTo(returnTo: string | undefined): string {
  const candidate = returnTo?.trim();

  // On autorise uniquement les chemins internes (/...) pour bloquer les open-redirect.
  if (candidate && candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  return "/";
}

function getPbEmailMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const response = (
    error as { response?: { data?: { email?: { message?: string } } } }
  ).response;
  const message = response?.data?.email?.message;

  return typeof message === "string" ? message : undefined;
}

export const server = {
  subscribeNewsletter: defineAction({
    accept: "form",
    input: newsletterSchema,
    handler: async (input, context) => {
      assertWithinRateLimit(context.clientAddress ?? "unknown");

      await sendContactEmail({
        firstName: "Newsletter",
        lastName: "Footer",
        email: input.email,
        subject: "Nouvelle inscription newsletter",
        message: `Nouvel email abonne: ${input.email}`,
      });

      return { success: true };
    },
  }),

  sendContact: defineAction({
    accept: "form",
    input: contactFormSchema,
    handler: async (input, context) => {
      // Honeypot: on retourne un succes silencieux pour ne pas informer le bot.
      if (input.hpField && input.hpField.trim().length > 0) {
        return { success: true };
      }

      assertWithinRateLimit(context.clientAddress ?? "unknown");

      await sendContactEmail({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        subject: input.subject,
        message: input.message,
      });

      return { success: true };
    },
  }),

  login: defineAction({
    accept: "form",
    input: loginSchema,
    handler: async (input, context) => {
      const email = normalizeEmail(input.email);
      const redirectTo = sanitizeReturnTo(input.returnTo);

      try {
        await context.locals.pb
          .collection("users")
          .authWithPassword(email, input.password);
        return { success: true, redirectTo };
      } catch {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe invalide.",
        });
      }
    },
  }),

  register: defineAction({
    accept: "form",
    input: registerSchema,
    handler: async (input, context) => {
      const email = normalizeEmail(input.email);

      try {
        await context.locals.pb.collection("users").create({
          email,
          password: input.password,
          passwordConfirm: input.passwordConfirm,
        });

        await context.locals.pb
          .collection("users")
          .authWithPassword(email, input.password);
        return { success: true };
      } catch (error) {
        const emailMessage = getPbEmailMessage(error);

        if (emailMessage && /already|existe|used|unique/i.test(emailMessage)) {
          throw new ActionError({
            code: "CONFLICT",
            message: "Cet email est deja utilise.",
          });
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Impossible de creer le compte pour le moment. Verifiez vos informations.",
        });
      }
    },
  }),
};
