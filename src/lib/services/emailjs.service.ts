import { ActionError } from "astro:actions";

interface SendContactEmailParams {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

function getEmailJsConfig() {
  const serviceId = import.meta.env.EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.EMAILJS_TEMPLATE_ID;
  const publicId = import.meta.env.EMAILJS_PUBLIC_ID;

  if (!serviceId || !templateId || !publicId) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Service email indisponible.",
    });
  }

  return { serviceId, templateId, publicId };
}

export async function sendContactEmail(params: SendContactEmailParams): Promise<void> {
  const { serviceId, templateId, publicId } = getEmailJsConfig();

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicId,
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
