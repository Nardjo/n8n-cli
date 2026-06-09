/**
 * Users resource — /users
 * Instance owner/admin only. List, invite, inspect, delete users and
 * change their global role.
 */
import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  limit?: string;
  cursor?: string;
  includeRole?: boolean;
  email?: string;
  role?: string;
}

export const usersResource = new Command("users").alias("user").description("Manage users (owner/admin only)");

// ── LIST ──────────────────────────────────────────────
usersResource
  .command("list")
  .description("List users")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--include-role", "Include each user's global role")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/users", {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
        ...(opts.includeRole && { includeRole: "true" }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
usersResource
  .command("get")
  .description("Get a user by ID or email")
  .argument("<idOrEmail>", "User ID or email")
  .option("--include-role", "Include the user's global role")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (idOrEmail: string, opts: Opts) => {
    try {
      const data = await client.get(`/users/${encodeURIComponent(idOrEmail)}`, {
        ...(opts.includeRole && { includeRole: "true" }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE (invite) ───────────────────────────────────
usersResource
  .command("create")
  .description("Invite one or more users by email")
  .requiredOption("--email <emails>", "Comma-separated email(s) to invite")
  .option("--role <role>", "Global role: global:admin or global:member", "global:member")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli users create --email jane@acme.com --role global:admin")
  .action(async (opts: Opts) => {
    try {
      const emails = (opts.email ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const body = emails.map((email) => ({ email, role: opts.role }));
      const data = await client.post("/users", body as unknown as Record<string, unknown>);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
usersResource
  .command("delete")
  .description("Delete a user")
  .argument("<idOrEmail>", "User ID or email")
  .option("--json", "Output as JSON")
  .action(async (idOrEmail: string, opts: Opts) => {
    try {
      const data = await client.delete(`/users/${encodeURIComponent(idOrEmail)}`);
      output(data ?? { deleted: true, id: idOrEmail }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CHANGE ROLE ───────────────────────────────────────
usersResource
  .command("set-role")
  .description("Change a user's global role")
  .argument("<idOrEmail>", "User ID or email")
  .requiredOption("--role <role>", "global:admin or global:member")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli users set-role jane@acme.com --role global:admin")
  .action(async (idOrEmail: string, opts: Opts) => {
    try {
      const data = await client.patch(`/users/${encodeURIComponent(idOrEmail)}/role`, {
        newRoleName: opts.role,
      });
      output(data ?? { updated: true, id: idOrEmail, role: opts.role }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
