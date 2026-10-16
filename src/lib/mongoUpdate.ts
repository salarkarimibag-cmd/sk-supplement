/**
 * Splits a partial update into MongoDB's $set and $unset operators.
 *
 * Mongoose silently drops keys whose value is undefined, so `{ flavor:
 * undefined }` would leave the old flavor in place. Here an undefined value
 * means "remove this field": it goes into $unset. Keys that aren't in the
 * object at all are left untouched.
 */
export function toSetAndUnset(update: Record<string, unknown>): {
  $set: Record<string, unknown>;
  $unset: Record<string, "">;
} {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ""> = {};

  for (const [key, value] of Object.entries(update)) {
    if (value === undefined) $unset[key] = "";
    else $set[key] = value;
  }

  return { $set, $unset };
}
