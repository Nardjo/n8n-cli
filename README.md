# n8n-cli

A CLI for the [n8n](https://n8n.io) public REST API (`/api/v1`). Drive any
self-hosted or n8n Cloud instance from the terminal: workflows, executions,
credentials, tags, variables, users, projects, source control, and audits.

Made with [api2cli.dev](https://api2cli.dev).

## Install

```bash
npx api2cli install <user>/n8n-cli
```

This clones the repo, builds the CLI, links it to your PATH, and installs the AgentSkill to your coding agents.

Or build from source:

```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli bundle n8n
npx api2cli link n8n
```

## Configure

n8n is instance-specific, so set your host (the `/api/v1` suffix is added automatically):

```bash
export N8N_BASE_URL="https://my.n8n.host"          # self-hosted
export N8N_BASE_URL="https://acme.app.n8n.cloud"   # n8n Cloud
```

Create an API key in n8n under **Settings → n8n API**, then:

```bash
n8n-cli auth set "n8n_api_xxx..."
n8n-cli auth test
```

The key is stored at `~/.config/tokens/n8n-cli.txt` and sent as the `X-N8N-API-KEY` header.

## Usage

```bash
n8n-cli --help                       # all resources + global flags
n8n-cli workflows list --active --json
n8n-cli workflows get <id> --json
n8n-cli workflows create --file workflow.json
n8n-cli workflows activate <id>
n8n-cli executions list --status error --workflow-id <id> --json
n8n-cli credentials schema githubApi --json
n8n-cli audit generate --categories credentials,database --json
```

## Resources

| Resource | Actions |
|----------|---------|
| `workflows` | list, get, create, update, delete, activate, deactivate, archive, unarchive, transfer, get-tags, set-tags |
| `executions` | list, get, delete, retry, stop |
| `credentials` | list, create, delete, schema, test, transfer |
| `tags` | list, get, create, update, delete |
| `variables` | list, create, update, delete |
| `users` | list, get, create, delete, set-role |
| `projects` | list, create, update, delete, members, add-member, set-member-role, remove-member |
| `source-control` | pull |
| `audit` | generate |

Run `n8n-cli <resource> --help` for the actions and flags of each resource.

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

Exit codes: `0` success · `1` API error · `2` usage error
