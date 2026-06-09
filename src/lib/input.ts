/**
 * Helpers for reading JSON request bodies from a file, an inline string, or stdin.
 * Used by resources that accept complex objects (workflows, credentials).
 */
import { readFileSync } from "fs";

/**
 * Resolve a JSON object from one of:
 *   --file <path>   read and parse a JSON file ("-" means stdin)
 *   --data <json>   parse an inline JSON string
 * Returns undefined if neither is provided.
 */
export function readJsonBody(opts: { file?: string; data?: string }): Record<string, unknown> | undefined {
  let raw: string | undefined;

  if (opts.file) {
    raw = opts.file === "-" ? readFileSync(0, "utf8") : readFileSync(opts.file, "utf8");
  } else if (opts.data) {
    raw = opts.data;
  }

  if (raw === undefined) return undefined;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("expected a JSON object");
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    throw new Error(`Invalid JSON body: ${(err as Error).message}`);
  }
}
