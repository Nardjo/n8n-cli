/**
 * Variables resource — /variables
 * Environment variables shared across workflows.
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
  key?: string;
  value?: string;
}

export const variablesResource = new Command("variables")
  .alias("variable")
  .description("Manage variables");

// ── LIST ──────────────────────────────────────────────
variablesResource
  .command("list")
  .description("List variables")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/variables", {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
variablesResource
  .command("create")
  .description("Create a variable")
  .requiredOption("--key <key>", "Variable key")
  .requiredOption("--value <value>", "Variable value")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli variables create --key API_BASE --value https://api.example.com")
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/variables", { key: opts.key, value: opts.value });
      output(data ?? { created: true, key: opts.key }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
variablesResource
  .command("update")
  .description("Update a variable's value")
  .argument("<id>", "Variable ID")
  .requiredOption("--key <key>", "Variable key")
  .requiredOption("--value <value>", "New value")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.put(`/variables/${id}`, { key: opts.key, value: opts.value });
      output(data ?? { updated: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
variablesResource
  .command("delete")
  .description("Delete a variable")
  .argument("<id>", "Variable ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.delete(`/variables/${id}`);
      output(data ?? { deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
