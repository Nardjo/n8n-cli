import { homedir } from "os";
import { join } from "path";

/** Application name (replaced during api2cli create) */
export const APP_NAME = "n8n";

/** CLI binary name (replaced during api2cli create) */
export const APP_CLI = "n8n-cli";

/**
 * API base URL. Every n8n instance has its own host, so this is resolved at
 * runtime from N8N_BASE_URL (or N8N_HOST). Point it at your instance root or
 * the full /api/v1 path — the `/api/v1` suffix is appended automatically.
 *   export N8N_BASE_URL="https://my.n8n.host"
 *   export N8N_BASE_URL="https://acme.app.n8n.cloud"
 */
function resolveBaseUrl(): string {
  let url = (process.env.N8N_BASE_URL ?? process.env.N8N_HOST ?? "https://YOUR-INSTANCE.app.n8n.cloud/api/v1").trim();
  url = url.replace(/\/+$/, "");
  if (!/\/api\/v\d+$/.test(url)) url += "/api/v1";
  return url;
}

export const BASE_URL = resolveBaseUrl();

/** Auth type: bearer | api-key | basic | custom */
export const AUTH_TYPE = "api-key";

/** Auth header name (e.g. Authorization, X-Api-Key) */
export const AUTH_HEADER = "X-N8N-API-KEY";

/** Path to the token file for this CLI */
export const TOKEN_PATH = join(homedir(), ".config", "tokens", `${APP_NAME}-cli.txt`);

/** Global state for output flags (set by root command) */
export const globalFlags = {
  json: false,
  format: "text" as "text" | "json" | "csv" | "yaml",
  verbose: false,
  noColor: false,
  noHeader: false,
};
