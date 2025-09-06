# GPTP Core

<p>
  <!-- Build status -->
  <img src="https://img.shields.io/github/actions/workflow/status/Yuxi-Labs/gptp-core/continuous-integration.yml?branch=release%2Fv0.2.1" alt="Build Status" />

  <!-- Latest Release -->
  <img src="https://img.shields.io/github/v/release/Yuxi-Labs/gptp-core?include_prereleases&sort=semver" alt="Latest Release" />

  <!-- Open Issues -->
  <img src="https://img.shields.io/github/issues/Yuxi-Labs/gptp-core" alt="Open Issues" />

  <!-- Pull Requests -->
  <img src="https://img.shields.io/github/issues-pr/Yuxi-Labs/gptp-core" alt="Pull Requests" />

  <!-- Last Commit -->
  <img src="https://img.shields.io/github/last-commit/Yuxi-Labs/gptp-core" alt="Last Commit" />

  <!-- Contributors -->
  <img src="https://img.shields.io/github/contributors/Yuxi-Labs/gptp-core" alt="Contributors" />

  <!-- License -->
  <img src="https://img.shields.io/badge/License-MIT-orange.svg" alt="License: MIT" />
</p>

Core SDK for working with **GPT Prompt (GPTP)** files.

This library provides validation, normalization, execution, formatting, migration, diffing and inspection utilities for GPTP. It is designed to be used by:

- CLI tools
- VS Code extensions
- Server & web apps
- Custom prompt runners and editors

---

See the latest changes in [CHANGELOG.md](./CHANGELOG.md).

## ✨ Features

- Validation: Validates `.gptp` JSON against the official GPTP Schema (v1.2.0). Remote-first with cached fallback.
- Parsing & Normalization: Parse prompt files and normalize shape for execution.
- Execution Engine: Resolve variables and call providers (OpenAI, Azure OpenAI, Anthropic, Meta Llama, Mistral, Cohere, Local).
- Provider router: Prompts are provider‑agnostic. A single `.gptp` can run against multiple providers via the `connections` block; responses are normalized.
- Formatting: Output formatters for `markdown`, `html`, `json`, and `plain-text`.
- Diff & Migrate: Compare prompts and upgrade between schema versions.
- Inspect: Extract variables and summarize message roles.

Tested on Node.js 18, 20, and 22.

---

## 📦 Installation

```sh
npm install @yuxilabs/gptp-core
```

---

## 🚀 Quick Start (API)

```ts
import { parsePrompt, validatePrompt, executePrompt, formatPrompt } from '@yuxi-labs/gptp-core';

async function main() {
  // 1) Parse a GPTP file (JSON)
  const prompt = await parsePrompt('docs/examples/hello-world.gptp');

  // 2) Validate against the GPTP schema (remote-first with cached fallback)
  const validation = await validatePrompt(prompt);
  if (!validation.valid) {
    console.error('❌ Validation failed:', validation.errors);
    process.exit(1);
  }

  // 3) Execute without calling a model (set run: true and configure provider keys to actually call)
  const { resolvedMessages, modelOutput } = await executePrompt(prompt, {
    input: { name: 'World' },
    run: false,
    // Optional cancellation & timeout support
    // signal: new AbortController().signal,
    // timeoutMs: 10_000,
  });

  // 4) Format output as markdown
  const output = formatPrompt({ content: modelOutput || 'Hello from GPTP!' }, { outputFormat: 'markdown' });
  console.log(output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## 🧰 CLI scripts (for this repo)

This repository ships several helper scripts for local development and demos:

- Execute: `npm run gptp:execute`
- Format: `npm run gptp:format`
- Diff: `npm run gptp:diff`
- Init: `npm run gptp:init`
- Migrate: `npm run gptp:migrate`
- Convert: `npm run gptp:convert`
- Benchmark: `npm run gptp:bench -- <file.gptp> [--iters=50] [--concurrency=5] [--run] [--out=REPO/BUILD/bench.json]`
- Playground: `npm run gptp:play -- <file.gptp> key=value ...`

Example (Windows PowerShell):

```powershell
$env:OPENAI_API_KEY = '<your-key>'
npm run gptp:execute
```

Notes:
- To call providers, set `run: true` in `executePrompt` and configure provider credentials.
 - `gptp:play` prints resolved messages and hashes, plus model output (great for debugging interpolation).
 - One run targets one provider. Change `connections.active` to switch providers; there’s no built‑in fan‑out.

---

## 🧪 Try it (end-to-end)

Below is a minimal flow to run a sample prompt and format the output as markdown.

```powershell
# 1) Install deps
npm install

# 2) Execute the hello world example (prints model output)
npm run gptp:execute -- docs/examples/hello-world.gptp user_name=World

# 4) Format an arbitrary output file (supports markdown/json/html/plain-text)
#    Here we format the raw model output or a string file
#    Example expects output.txt or a JSON with {"content": "..."}
npm run gptp:format -- output.txt --format=markdown

# Optional: run quick playground
npm run gptp:play -- docs/examples/hello-world.gptp user_name=World

# Optional: run a micro-benchmark (add --run to call providers for real)
npm run gptp:bench -- docs/examples/hello-world.gptp --iters=25 --concurrency=4
```

If you want to call OpenAI:

```powershell
$env:OPENAI_API_KEY = '<your-key>'
npm run gptp:execute -- docs/examples/hello-world.gptp user_name=World
```

No keys? Try the Local adapter (predictable output):

```powershell
# In your .gptp, add a provider block
# "connections": { "active": "local", "providers": { "local": { "type": "local" } } }
npm run gptp:execute -- docs/examples/hello-world.gptp user_name=World
# Expected output: LOCAL:Hello World!
```

---

## 🔍 Validation policy

- If `GPTP_SCHEMA_LOCAL` is set to a file path, load that JSON schema first (offline/dev)
- Otherwise fetch the remote URL in `GPTP_SCHEMA_URL` first
- If remote is unavailable, fall back to the local cache at `.gptp/cache/gptp.schema.json`
- If both fail, validation aborts with a clear error message

Example schema URL (v1.2.0):

```text
https://raw.githubusercontent.com/Yuxi-Labs/gptp/refs/tags/v1.2.0/schema/gptp.schema.json
```

---

## ⚙️ Environment variables

| Name                     | Purpose                                                     | Required |
| ------------------------ | ----------------------------------------------------------- | -------- |
| `GPTP_SCHEMA_LOCAL`      | Absolute/relative path to a local GPTP JSON Schema         | ❌       |
| `GPTP_SCHEMA_URL`        | Remote URL for GPTP JSON Schema                            | ✅       |
| `GPTP_DEBUG`             | Verbose debug logs (`true`/`false`)                        | ❌       |
| `OPENAI_API_KEY`         | Needed for OpenAI provider                                 | ❌       |
| `AZURE_OPENAI_ENDPOINT`  | Azure resource endpoint (e.g., https://foo.openai.azure.com) | ❌     |
| `AZURE_OPENAI_API_KEY`   | Azure OpenAI API key                                       | ❌       |
| `AZURE_OPENAI_DEPLOYMENT`| Azure deployment name (often mapped from `params.model`)   | ❌       |
| `AZURE_OPENAI_API_VERSION` | Azure API version (default: 2024-02-15-preview)         | ❌       |
| `ANTHROPIC_API_KEY`      | Needed for Anthropic provider                              | ❌       |
| `MISTRAL_API_KEY`        | Needed for Mistral provider                                | ❌       |
| `COHERE_API_KEY`         | Needed for Cohere provider                                 | ❌       |
| `OPENROUTER_API_KEY`     | Needed for Meta (via OpenRouter)                           | ❌       |
| `META_LLAMA_API_KEY`     | Optional fallback for Meta                                 | ❌       |

Local adapter requires no keys.

Secrets policy:
- In `.gptp`, reference secrets as `env:NAME` (for example, `env:ANTHROPIC_API_KEY`) instead of inline values.
- Inline secrets in `.gptp` are discouraged and will log warnings at runtime.
- During execution, the runtime resolves `env:*` references and can populate canonical env names (e.g., `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).

---

## 🔀 Provider routing (connections)

Prompts are provider‑agnostic. The `connections` block selects the adapter; if missing, default is `openai`.

```jsonc
{
  // ...other GPTP fields
  "connections": {
    "active": "azure-prod",
    "providers": {
      "azure-prod": { "type": "microsoft" },
      "claude": { "type": "anthropic" },
      "default": { "type": "openai" }
    }
  }
}
```

Run the same prompt across providers by changing `connections.active` between runs.

---

## 📚 API surface

From `@yuxi-labs/gptp-core`:

- `parsePrompt(filePath)` → `Promise<GPTPDocument>`
- `validatePrompt(prompt)` → `Promise<{ valid: boolean; errors: AjvError[]; data?: GPTPDocument }>`
- `normalizePrompt(prompt)` → `GPTPDocument`
- `executePrompt(prompt, { input, run, signal?, timeoutMs?, retry?, lockfilePath? })` → `Promise<{ resolvedMessages, modelOutput, renderedPromptHash?, variablesHash? }>`
- `formatPrompt(rawOutput, { outputFormat, outputSchema })` → `string`
- `formatOutput(rawOutput, { outputFormat, outputSchema })` → `string`
- `inspectPrompt`, `getDeclaredVariables`, `getRequiredVariables`, `getMessageRoles`, `summarizePrompt`
- `migratePrompt`, `migrateTo120`
- `convertPrompt`, `diffPromptKeys`, `initPrompt`
- `loadProfile`

Formatting supports: `markdown`, `html`, `json`, `plain-text`. Unsupported formats throw `Unsupported output format: <format>`.

---

## 🧪 Development

Install deps:

```sh
npm install
```

Run tests:

```sh
npm test
```

Build:

```sh
npm run build
```

Lint & format:

```sh
npm run lint
npm run format
```

Debug (verbose logs):

```sh
npm run dev:debug
```

---

## 📜 License

MIT © William Sawyerrr