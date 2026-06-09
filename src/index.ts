#!/usr/bin/env bun
import { Command } from "commander";
import { globalFlags } from "./lib/config.js";
import { authCommand } from "./commands/auth.js";
import { workflowsResource } from "./resources/workflows.js";
import { executionsResource } from "./resources/executions.js";
import { credentialsResource } from "./resources/credentials.js";
import { tagsResource } from "./resources/tags.js";
import { variablesResource } from "./resources/variables.js";
import { usersResource } from "./resources/users.js";
import { projectsResource } from "./resources/projects.js";
import { sourceControlResource } from "./resources/source-control.js";
import { auditResource } from "./resources/audit.js";

const program = new Command();

program
  .name("n8n-cli")
  .description("CLI for the n8n public REST API (workflows, executions, credentials, and more)")
  .version("0.1.0")
  .option("--json", "Output as JSON", false)
  .option("--format <fmt>", "Output format: text, json, csv, yaml", "text")
  .option("--verbose", "Enable debug logging", false)
  .option("--no-color", "Disable colored output")
  .option("--no-header", "Omit table/csv headers (for piping)")
  .hook("preAction", (_thisCmd, actionCmd) => {
    const root = actionCmd.optsWithGlobals();
    globalFlags.json = root.json ?? false;
    globalFlags.format = root.format ?? "text";
    globalFlags.verbose = root.verbose ?? false;
    globalFlags.noColor = root.color === false;
    globalFlags.noHeader = root.header === false;
  });

// Built-in commands
program.addCommand(authCommand);

// Resources
program.addCommand(workflowsResource);
program.addCommand(executionsResource);
program.addCommand(credentialsResource);
program.addCommand(tagsResource);
program.addCommand(variablesResource);
program.addCommand(usersResource);
program.addCommand(projectsResource);
program.addCommand(sourceControlResource);
program.addCommand(auditResource);

program.parse();
