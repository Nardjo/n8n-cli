/**
 * Projects resource — /projects
 * Manage projects (Enterprise) and their members.
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
  userId?: string;
  role?: string;
}

export const projectsResource = new Command("projects")
  .alias("project")
  .description("Manage projects and members");

// ── LIST ──────────────────────────────────────────────
projectsResource
  .command("list")
  .description("List projects")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/projects", {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
projectsResource
  .command("create")
  .description("Create a project")
  .requiredOption("--name <name>", "Project name")
  .option("--json", "Output as JSON")
  .action(async (opts: Opts) => {
    try {
      const data = await client.post("/projects", { name: opts.name });
      output(data ?? { created: true, name: opts.name }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
projectsResource
  .command("update")
  .description("Rename a project")
  .argument("<id>", "Project ID")
  .requiredOption("--name <name>", "New project name")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.put(`/projects/${id}`, { name: opts.name });
      output(data ?? { updated: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
projectsResource
  .command("delete")
  .description("Delete a project")
  .argument("<id>", "Project ID")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts: Opts) => {
    try {
      const data = await client.delete(`/projects/${id}`);
      output(data ?? { deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── MEMBERS: LIST ─────────────────────────────────────
projectsResource
  .command("members")
  .description("List members of a project")
  .argument("<projectId>", "Project ID")
  .option("--limit <n>", "Max results (max 250)", "100")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (projectId: string, opts: Opts) => {
    try {
      const data = await client.get(`/projects/${projectId}/users`, {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── MEMBERS: ADD ──────────────────────────────────────
projectsResource
  .command("add-member")
  .description("Add a user to a project")
  .argument("<projectId>", "Project ID")
  .requiredOption("--user-id <id>", "User ID to add")
  .requiredOption("--role <role>", "project:admin, project:editor or project:viewer")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  n8n-cli projects add-member PROJ1 --user-id U1 --role project:editor")
  .action(async (projectId: string, opts: Opts) => {
    try {
      const data = await client.post(`/projects/${projectId}/users`, {
        relations: [{ userId: opts.userId, role: opts.role }],
      });
      output(data ?? { added: true, projectId, userId: opts.userId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── MEMBERS: SET ROLE ─────────────────────────────────
projectsResource
  .command("set-member-role")
  .description("Change a user's role in a project")
  .argument("<projectId>", "Project ID")
  .argument("<userId>", "User ID")
  .requiredOption("--role <role>", "project:admin, project:editor or project:viewer")
  .option("--json", "Output as JSON")
  .action(async (projectId: string, userId: string, opts: Opts) => {
    try {
      const data = await client.patch(`/projects/${projectId}/users/${userId}`, {
        role: opts.role,
      });
      output(data ?? { updated: true, projectId, userId, role: opts.role }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── MEMBERS: REMOVE ───────────────────────────────────
projectsResource
  .command("remove-member")
  .description("Remove a user from a project")
  .argument("<projectId>", "Project ID")
  .argument("<userId>", "User ID")
  .option("--json", "Output as JSON")
  .action(async (projectId: string, userId: string, opts: Opts) => {
    try {
      const data = await client.delete(`/projects/${projectId}/users/${userId}`);
      output(data ?? { removed: true, projectId, userId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
