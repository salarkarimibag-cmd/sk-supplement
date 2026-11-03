import type { Instrumentation } from "next";
import { sendEmail } from "@/lib/email";
import { buildErrorAlert, errorAlertKey, shouldSendAlert } from "@/lib/errorAlert";
import { SITE_URL } from "@/lib/site";

// Kept in memory, so each server instance counts on its own: a failing
// database can't stop the alert that reports it. A busy outage may send one
// email per instance, which is still only a handful.
const sentAlerts = new Map<string, number>();

// Next.js calls this for every error it catches on the server, in pages and
// in API routes. Errors a route catches itself don't arrive here.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const to = process.env.ALERT_EMAIL;
  if (!to) return;

  const details = {
    message: error instanceof Error ? error.message : String(error),
    digest:
      typeof error === "object" && error !== null && "digest" in error
        ? String(error.digest)
        : undefined,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  };
  if (!shouldSendAlert(errorAlertKey(details), Date.now(), sentAlerts)) return;

  try {
    await sendEmail({ to, ...buildErrorAlert(details, SITE_URL) });
  } catch (sendError) {
    console.error("Could not send the error alert:", sendError);
  }
};
