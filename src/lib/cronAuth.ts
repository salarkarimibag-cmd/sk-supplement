/**
 * Whether a request to a cron route comes from Vercel, which sends
 * `Authorization: Bearer <CRON_SECRET>`. Without a secret nothing passes, so
 * a variable missing from the environment closes the route instead of
 * leaving it open to anyone.
 */
export function isCronAuthorized(authorization: string | null, secret: string | undefined): boolean {
  return Boolean(secret) && authorization === `Bearer ${secret}`;
}
