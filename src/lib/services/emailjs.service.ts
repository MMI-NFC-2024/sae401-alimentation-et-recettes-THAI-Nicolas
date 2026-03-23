import { ActionError } from "astro:actions";

interface SendContactEmailParams {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

function getEmailJsConfig() {
  // En production (service systemd), process.env est la source fiable en runtime.
  const serviceId =
    import.meta.env.EMAILJS_SERVICE_ID ?? process.env.EMAILJS_SERVICE_ID;
  const templateId =
    import.meta.env.EMAILJS_TEMPLATE_ID ?? process.env.EMAILJS_TEMPLATE_ID;
  const publicId =
    import.meta.env.EMAILJS_PUBLIC_ID ?? process.env.EMAILJS_PUBLIC_ID;
  const privateKey =
    import.meta.env.EMAILJS_PRIVATE_KEY ?? process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicId || !privateKey) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Service email indisponible.",
    });
  }

  return { serviceId, templateId, publicId, privateKey };
}

export async function sendContactEmail(params: SendContactEmailParams): Promise<void> {
  const { serviceId, templateId, publicId, privateKey } = getEmailJsConfig();

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicId,
      accessToken: privateKey,
      template_params: {
        prenom: params.firstName,
        nom: params.lastName,
        from_email: params.email,
        subject: params.subject,
        message: params.message,
      },
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    console.error("EmailJS error", { status: response.status, responseText });

    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Impossible d'envoyer votre message pour le moment.",
    });
  }
}
