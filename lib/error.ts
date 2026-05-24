export function extractMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null) {
    const obj = e as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message) return obj.message;
    if (typeof obj.error_description === "string") return obj.error_description;
    if (typeof obj.details === "string" && obj.details) return obj.details;
  }
  return String(e);
}
