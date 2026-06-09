/**
 * Tags resource — /tags
 * Standard CRUD for workflow tags.
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
  name?: string;
}

export const tagsResource = new Command("tags").alias("tag").description("Manage tags");

// ── LIST ──────────────────────────────────────────────
tagsResource
  .command("list")
  .description("List tags")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/tags", {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
tagsResource
  .command("get")
  .description("Get a tag by ID")
  .argument("<id>", "Tag ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.get(`/tags/${id}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
tagsResource
  .command("create")
  .description("Create a tag")
  .requiredOption("--name <name>", "Tag name")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/tags", { name: opts.name });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
tagsResource
  .command("update")
  .description("Rename a tag")
  .argument("<id>", "Tag ID")
  .requiredOption("--name <name>", "New tag name")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.put(`/tags/${id}`, { name: opts.name });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
tagsResource
  .command("delete")
  .description("Delete a tag")
  .argument("<id>", "Tag ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.delete(`/tags/${id}`);
      output(data ?? { deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
