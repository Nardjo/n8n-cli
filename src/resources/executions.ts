/**
 * Executions resource — /executions
 * Inspect, delete, retry and stop workflow runs.
 */
import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  status?: string;
  workflowId?: string;
  projectId?: string;
  includeData?: boolean;
  limit?: string;
  cursor?: string;
}

export const executionsResource = new Command("executions")
  .alias("execution")
  .description("Manage workflow executions");

// ── LIST ──────────────────────────────────────────────
executionsResource
  .command("list")
  .description("List executions")
  .option("--status <status>", "Filter: success, error, waiting, running, canceled, crashed, new, unknown")
  .option("--workflow-id <id>", "Filter by workflow ID")
  .option("--project-id <id>", "Filter by project ID")
  .option("--include-data", "Include full execution data")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  n8n-cli executions list --status error --json\n  n8n-cli executions list --workflow-id 1a2b3c --limit 20")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/executions", {
        ...(opts.status && { status: opts.status }),
        ...(opts.workflowId && { workflowId: opts.workflowId }),
        ...(opts.projectId && { projectId: opts.projectId }),
        ...(opts.includeData && { includeData: "true" }),
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
executionsResource
  .command("get")
  .description("Get an execution by ID")
  .argument("<id>", "Execution ID")
  .option("--include-data", "Include full execution data")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  n8n-cli executions get 42 --include-data --json")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/executions/${id}`, {
        ...(opts.includeData && { includeData: "true" }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
executionsResource
  .command("delete")
  .description("Delete an execution")
  .argument("<id>", "Execution ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli executions delete 42")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.delete(`/executions/${id}`);
      output(data ?? { deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── RETRY ─────────────────────────────────────────────
executionsResource
  .command("retry")
  .description("Retry a failed execution")
  .argument("<id>", "Execution ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/executions/${id}/retry`);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── STOP ──────────────────────────────────────────────
executionsResource
  .command("stop")
  .description("Stop a running execution")
  .argument("<id>", "Execution ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/executions/${id}/stop`);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
