/**
 * Whether a MongoDB write failed on a unique index (error code 11000), e.g.
 * two requests saving the same email or slug at once: both can pass a
 * findOne check before either has written, and only the index stops the
 * second. The caller turns it into a 409 instead of letting it become a 500.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}
