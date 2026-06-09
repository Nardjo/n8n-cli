/**
 * Credentials resource — /credentials
 * Create/delete credentials, fetch the schema for a credential type,
 * test a credential and transfer it to another project.
 * Note: the API never returns credential secrets.
 */
import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";
import { readJsonBody } from "../lib/input.js";

interface Opts {
  json?: boolean;
  format?: string;
  limit?: string;
  cursor?: string;
  file?: string;
  data?: string;
  projectId?: string;
}

export const credentialsResource = new Command("credentials")
  .alias("credential")
  .description("Manage credentials");

// ── LIST ──────────────────────────────────────────────
credentialsResource
  .command("list")
  .description("List credentials (owner/admin only; secrets excluded)")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/credentials", {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
credentialsResource
  .command("create")
  .description("Create a credential")
  .option("--file <path>", "Path to credential JSON file ('-' for stdin)")
  .option("--data <json>", "Inline credential JSON")
  .option("--json", "Output as JSON")
  .addHelpText("after", '\nExamples:\n  n8n-cli credentials create --data \'{"name":"My Cred","type":"githubApi","data":{"accessToken":"..."}}\'\n  n8n-cli credentials create --file cred.json')
  .action(async (opts: Opts) => {
    try {
      const body = readJsonBody(opts);
      if (!body) throw new Error("Provide a credential with --file or --data");
      const data = await client.post("/credentials", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
credentialsResource
  .command("delete")
  .description("Delete a credential")
  .argument("<id>", "Credential ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.delete(`/credentials/${id}`);
      output(data ?? { deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SCHEMA ────────────────────────────────────────────
credentialsResource
  .command("schema")
  .description("Get the data schema for a credential type")
  .argument("<type>", "Credential type name (e.g. githubApi, slackApi)")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  n8n-cli credentials schema githubApi --json")
  .action(async (type: string, opts: Opts) => {
    try {
      const data = await client.get(`/credentials/schema/${type}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── TEST ──────────────────────────────────────────────
credentialsResource
  .command("test")
  .description("Test a credential's connectivity")
  .argument("<id>", "Credential ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/credentials/${id}/test`);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── TRANSFER ──────────────────────────────────────────
credentialsResource
  .command("transfer")
  .description("Transfer a credential to another project")
  .argument("<id>", "Credential ID")
  .requiredOption("--project-id <id>", "Destination project ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.put(`/credentials/${id}/transfer`, {
        destinationProjectId: opts.projectId,
      });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
