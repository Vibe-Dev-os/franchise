export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// Deep-clones a Mongoose lean() result into plain JSON (ObjectId -> string,
// Date -> ISO string). Typed loosely on purpose: callers declare their own
// plain row/view types for the shape actually returned after serialization.
export function serialize<T = any>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc));
}
