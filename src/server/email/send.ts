import { Resend } from "resend";
import type { DB } from "@/server/db/client";
import { emailLog } from "@/server/db/schema";

/**
 * Send an email via Resend and log the outcome to email_log (never the body).
 * If no API key is configured (local dev), it logs a skip instead of throwing,
 * so flows keep working; the link is also printed by the caller in dev.
 */
export async function sendEmail(
  db: DB,
  input: { to: string; subject: string; html: string; template: string; headers?: Record<string, string> }
): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "Second Cycle <no-reply@localhost>";
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    await db.insert(emailLog).values({
      toEmail: input.to,
      template: input.template,
      subject: input.subject,
      status: "failed",
      error: "RESEND_API_KEY not set",
    });
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      headers: input.headers,
    });
    await db.insert(emailLog).values({
      toEmail: input.to,
      template: input.template,
      subject: input.subject,
      status: error ? "failed" : "sent",
      providerId: data?.id ?? null,
      error: error ? String(error.message ?? error) : null,
    });
  } catch (e) {
    await db.insert(emailLog).values({
      toEmail: input.to,
      template: input.template,
      subject: input.subject,
      status: "failed",
      error: e instanceof Error ? e.message : "send failed",
    });
  }
}
