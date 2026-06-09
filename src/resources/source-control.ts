/**
 * Source control resource — /source-control
 * Pull changes from the connected Git remote (Enterprise).
 */
import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  force?: boolean;
  autoPublish?: string;
}

export const sourceControlResource = new Command("source-control")
  .alias("sc")
  .description("Source control (Git) operations");

// ── PULL ──────────────────────────────────────────────
sourceControlResource
  .command("pull")
  .description("Pull changes from the remote repository")
  .option("--force", "Force the pull, overwriting local changes")
  .option("--auto-publish <mode>", "Publish imported workflows: none, all, published", "none")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli source-control pull --force --auto-publish all")
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/source-control/pull", {
        ...(opts.force && { force: true }),
        ...(opts.autoPublish && { autoPublish: opts.autoPublish }),
      });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
