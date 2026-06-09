/**
 * Audit resource — /audit
 * Generate a security audit report for the instance.
 */
import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  daysAbandoned?: string;
  categories?: string;
}

export const auditResource = new Command("audit").description("Security audit");

// ── GENERATE ──────────────────────────────────────────
auditResource
  .command("generate")
  .description("Generate a security audit of the instance")
  .option("--days-abandoned <n>", "Days after which a workflow counts as abandoned")
  .option("--categories <list>", "Comma-separated: credentials,database,nodes,filesystem,instance")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  n8n-cli audit generate --categories credentials,database --json")
  .action(async (opts: Opts) => {
    try {
      const additionalOptions: Record<string, unknown> = {};
      if (opts.daysAbandoned) additionalOptions.daysAbandonedWorkflow = Number(opts.daysAbandoned);
      if (opts.categories) {
        additionalOptions.categories = opts.categories.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const body = Object.keys(additionalOptions).length ? { additionalOptions } : {};
      const data = await client.post("/audit", body);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
