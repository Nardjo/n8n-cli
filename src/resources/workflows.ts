/**
 * Workflows resource — /workflows
 * Full lifecycle: list, get, create, update, delete, activate/deactivate,
 * archive/unarchive, transfer between projects, and tag management.
 */
import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";
import { readJsonBody } from "../lib/input.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  active?: boolean;
  tags?: string;
  name?: string;
  projectId?: string;
  excludePinnedData?: boolean;
  limit?: string;
  cursor?: string;
  file?: string;
  data?: string;
}

export const workflowsResource = new Command("workflows")
  .alias("workflow")
  .description("Manage workflows");

// ── LIST ──────────────────────────────────────────────
workflowsResource
  .command("list")
  .description("List all workflows")
  .option("--active", "Only active workflows")
  .option("--tags <names>", "Filter by tags (comma-separated, e.g. prod,test)")
  .option("--name <name>", "Filter by workflow name")
  .option("--project-id <id>", "Filter by project ID")
  .option("--exclude-pinned-data", "Do not return pinned data")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExamples:\n  n8n-cli workflows list --active --json\n  n8n-cli workflows list --tags prod --limit 50")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/workflows", {
        ...(opts.active && { active: "true" }),
        ...(opts.tags && { tags: opts.tags }),
        ...(opts.name && { name: opts.name }),
        ...(opts.projectId && { projectId: opts.projectId }),
        ...(opts.excludePinnedData && { excludePinnedData: "true" }),
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
workflowsResource
  .command("get")
  .description("Get a workflow by ID")
  .argument("<id>", "Workflow ID")
  .option("--exclude-pinned-data", "Do not return pinned data")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  n8n-cli workflows get 1a2b3c --json")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/workflows/${id}`, {
        ...(opts.excludePinnedData && { excludePinnedData: "true" }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
workflowsResource
  .command("create")
  .description("Create a workflow from a JSON definition")
  .option("--file <path>", "Path to workflow JSON file ('-' for stdin)")
  .option("--data <json>", "Inline workflow JSON")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExamples:\n  n8n-cli workflows create --file workflow.json\n  cat wf.json | n8n-cli workflows create --file -")
  .action(async (opts: Opts) => {
    try {
      const body = readJsonBody(opts);
      if (!body) throw new Error("Provide a workflow with --file or --data");
      const data = await client.post("/workflows", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
workflowsResource
  .command("update")
  .description("Update a workflow from a JSON definition")
  .argument("<id>", "Workflow ID")
  .option("--file <path>", "Path to workflow JSON file ('-' for stdin)")
  .option("--data <json>", "Inline workflow JSON")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli workflows update 1a2b3c --file workflow.json")
  .action(async (id: string, opts: Opts) => {
    try {
      const body = readJsonBody(opts);
      if (!body) throw new Error("Provide a workflow with --file or --data");
      const data = await client.put(`/workflows/${id}`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
workflowsResource
  .command("delete")
  .description("Delete a workflow")
  .argument("<id>", "Workflow ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli workflows delete 1a2b3c")
  .action(async (id: string, opts: Opts) => {
    try {
      await client.delete(`/workflows/${id}`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ACTIVATE / DEACTIVATE ─────────────────────────────
workflowsResource
  .command("activate")
  .description("Activate a workflow")
  .argument("<id>", "Workflow ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/workflows/${id}/activate`);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

workflowsResource
  .command("deactivate")
  .description("Deactivate a workflow")
  .argument("<id>", "Workflow ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/workflows/${id}/deactivate`);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── ARCHIVE / UNARCHIVE ───────────────────────────────
workflowsResource
  .command("archive")
  .description("Archive a workflow")
  .argument("<id>", "Workflow ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/workflows/${id}/archive`);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

workflowsResource
  .command("unarchive")
  .description("Unarchive a workflow")
  .argument("<id>", "Workflow ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.post(`/workflows/${id}/unarchive`);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── TRANSFER ──────────────────────────────────────────
workflowsResource
  .command("transfer")
  .description("Transfer a workflow to another project")
  .argument("<id>", "Workflow ID")
  .requiredOption("--project-id <id>", "Destination project ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli workflows transfer 1a2b3c --project-id VmwOO9HeTEj20kxM")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.put(`/workflows/${id}/transfer`, {
        destinationProjectId: opts.projectId,
      });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── TAGS ──────────────────────────────────────────────
workflowsResource
  .command("get-tags")
  .description("List the tags of a workflow")
  .argument("<id>", "Workflow ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/workflows/${id}/tags`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

workflowsResource
  .command("set-tags")
  .description("Replace the tags of a workflow")
  .argument("<id>", "Workflow ID")
  .requiredOption("--tag-ids <ids>", "Comma-separated tag IDs")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli workflows set-tags 1a2b3c --tag-ids t1,t2")
  .action(async (id: string, opts: Opts & { tagIds?: string }) => {
    try {
      const ids = (opts.tagIds ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const data = await client.put(
        `/workflows/${id}/tags`,
        ids.map((tid) => ({ id: tid })) as unknown as Record<string, unknown>,
      );
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
