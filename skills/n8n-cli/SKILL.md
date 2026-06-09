---
name: n8n
description: "Manage n8n via CLI - workflows, executions, credentials, tags, variables, users, projects, source-control, audit. Use when user mentions 'n8n', 'n8n workflow', 'workflow automation', 'n8n execution', 'activate workflow', 'n8n credentials', 'n8n API', or wants to interact with an n8n instance from the terminal."
category: devtools
---

# n8n-cli

CLI wrapper around the n8n public REST API (`/api/v1`). Drive any self-hosted or
n8n Cloud instance: manage workflows, inspect executions, handle credentials,
tags, variables, users, projects, Git source control, and security audits.

## When To Use This Skill

Use the `n8n-cli` skill when you need to:

- List, inspect, create, update or delete n8n workflows
- Activate, deactivate, archive or unarchive a workflow
- Inspect, retry, stop or delete workflow executions (filter by status/workflow)
- Manage credentials (create, delete, test, fetch a type's schema, transfer)
- Manage tags, variables, users, and projects (incl. project members/roles)
- Pull changes from the connected Git repository (source control)
- Generate a security audit of the instance

## Capabilities

- **Workflows**: full lifecycle + activation, archiving, project transfer, tags
- **Executions**: list/filter by status & workflow, fetch full data, retry/stop/delete
- **Credentials**: create from JSON, delete, test, get schema by type, transfer
- **Tags / Variables**: CRUD
- **Users**: list, invite, get, delete, change global role (owner/admin only)
- **Projects**: CRUD + member management with project roles (Enterprise)
- **Source control**: pull from remote with `--force` / `--auto-publish`
- **Audit**: generate categorized security report

## Common Use Cases

```bash
# Find every failed execution for a workflow
n8n-cli executions list --workflow-id 1a2b3c --status error --json

# Activate a workflow after importing it
n8n-cli workflows create --file my-workflow.json --json
n8n-cli workflows activate <new-id>

# Back up all workflows to disk (jq required)
n8n-cli workflows list --limit 250 --json | jq -c '.data[]'

# Rotate a credential and verify it
n8n-cli credentials test <id> --json

# Security review of the instance
n8n-cli audit generate --categories credentials,database --json
```

## Setup

If `n8n-cli` is not found, install and build it:
```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli bundle n8n
npx api2cli link n8n
```

`api2cli link` adds `~/.local/bin` to PATH automatically.

### Point the CLI at your instance (required)

Each n8n instance has its own host, so the base URL is read at runtime from an
environment variable. Set it to your instance root — the `/api/v1` suffix is
added automatically:

```bash
export N8N_BASE_URL="https://my.n8n.host"          # self-hosted
export N8N_BASE_URL="https://acme.app.n8n.cloud"   # n8n Cloud
```

If unset, the CLI returns auth/connection errors against a placeholder host.

Always use `--json` when calling commands programmatically.

## Authentication

n8n uses an API key sent in the `X-N8N-API-KEY` header. Create a key in n8n under
**Settings → n8n API**, then:

```bash
n8n-cli auth set "n8n_api_xxx..."
n8n-cli auth test
```

Auth commands: `auth set <token>`, `auth show`, `auth remove`, `auth test`

Token is stored in `~/.config/tokens/n8n-cli.txt` (chmod 600).

## Resources

### workflows (alias: workflow)

| Command | Description | Key flags |
|---------|-------------|-----------|
| `list` | List workflows | `--active`, `--tags <a,b>`, `--name`, `--project-id`, `--exclude-pinned-data`, `--limit`, `--cursor` |
| `get <id>` | Get a workflow | `--exclude-pinned-data` |
| `create` | Create from JSON | `--file <path\|->`, `--data <json>` |
| `update <id>` | Replace from JSON | `--file <path\|->`, `--data <json>` |
| `delete <id>` | Delete a workflow | |
| `activate <id>` | Activate | |
| `deactivate <id>` | Deactivate | |
| `archive <id>` | Archive | |
| `unarchive <id>` | Unarchive | |
| `transfer <id>` | Move to another project | `--project-id <id>` (required) |
| `get-tags <id>` | List a workflow's tags | |
| `set-tags <id>` | Replace a workflow's tags | `--tag-ids <a,b>` (required) |

### executions (alias: execution)

| Command | Description | Key flags |
|---------|-------------|-----------|
| `list` | List executions | `--status`, `--workflow-id`, `--project-id`, `--include-data`, `--limit`, `--cursor` |
| `get <id>` | Get an execution | `--include-data` |
| `delete <id>` | Delete an execution | |
| `retry <id>` | Retry a failed execution | |
| `stop <id>` | Stop a running execution | |

`--status`: `success`, `error`, `waiting`, `running`, `canceled`, `crashed`, `new`, `unknown`

### credentials (alias: credential)

| Command | Description | Key flags |
|---------|-------------|-----------|
| `list` | List credentials (owner/admin; secrets excluded) | `--limit`, `--cursor` |
| `create` | Create a credential | `--file <path\|->`, `--data <json>` |
| `delete <id>` | Delete a credential | |
| `schema <type>` | Get data schema for a credential type | |
| `test <id>` | Test connectivity | |
| `transfer <id>` | Move to another project | `--project-id <id>` (required) |

### tags (alias: tag)

`list` · `get <id>` · `create --name` · `update <id> --name` · `delete <id>`

### variables (alias: variable)

`list` · `create --key --value` · `update <id> --key --value` · `delete <id>`

### users (alias: user) — owner/admin only

| Command | Description | Key flags |
|---------|-------------|-----------|
| `list` | List users | `--include-role`, `--limit`, `--cursor` |
| `get <idOrEmail>` | Get a user | `--include-role` |
| `create` | Invite user(s) by email | `--email <a,b>` (required), `--role` |
| `delete <idOrEmail>` | Delete a user | |
| `set-role <idOrEmail>` | Change global role | `--role global:admin\|global:member` (required) |

### projects (alias: project) — Enterprise

| Command | Description | Key flags |
|---------|-------------|-----------|
| `list` | List projects | `--limit`, `--cursor` |
| `create` | Create a project | `--name` (required) |
| `update <id>` | Rename a project | `--name` (required) |
| `delete <id>` | Delete a project | |
| `members <projectId>` | List project members | `--limit`, `--cursor` |
| `add-member <projectId>` | Add a user | `--user-id`, `--role` (both required) |
| `set-member-role <projectId> <userId>` | Change member role | `--role` (required) |
| `remove-member <projectId> <userId>` | Remove a user | |

Project roles: `project:admin`, `project:editor`, `project:viewer`

### source-control (alias: sc)

| Command | Description | Key flags |
|---------|-------------|-----------|
| `pull` | Pull from remote Git repo | `--force`, `--auto-publish none\|all\|published` |

### audit

| Command | Description | Key flags |
|---------|-------------|-----------|
| `generate` | Generate a security audit | `--days-abandoned <n>`, `--categories <list>` |

Audit categories: `credentials`, `database`, `nodes`, `filesystem`, `instance`

## Working Rules

- Always use `--json` for agent-driven calls so downstream steps can parse the result.
- Set `N8N_BASE_URL` before any call — without it requests hit a placeholder host.
- Start with `--help` if the exact action or flags are unclear instead of guessing.
- Prefer read commands (`list`/`get`) before mutating data.
- `workflows create/update` and `credentials create` take a JSON body via `--file` (use `-` for stdin) or `--data`.

## Output Format

`--json` returns a standardized envelope:
```json
{ "ok": true, "data": { ... }, "meta": { "total": 42 } }
```

On error: `{ "ok": false, "error": { "message": "...", "status": 401 } }`

## Quick Reference

```bash
n8n-cli --help                     # List all resources and global flags
n8n-cli <resource> --help          # List all actions for a resource
n8n-cli <resource> <action> --help # Show flags for a specific action
```

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

Exit codes: 0 = success, 1 = API error, 2 = usage error
