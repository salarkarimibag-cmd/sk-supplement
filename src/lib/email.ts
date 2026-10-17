interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends an email through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Without RESEND_API_KEY and EMAIL_FROM it prints the message to the server
 * console in development, so flows like password reset can be tested without
 * an email account. In production it logs an error instead, since printing
 * the message there would put reset links in the deployment logs.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      console.error("Email is not configured: set RESEND_API_KEY and EMAIL_FROM.");
    } else {
      console.log(`\n[email] to: ${message.to}\n[email] subject: ${message.subject}\n${message.text}\n`);
    }
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...message }),
  });

  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  }
}
