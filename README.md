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

## ✨ Features

- Validation: Validates `.gptp` JSON against the official GPTP Schema (v1.2.0). Remote-first with cached fallback.
- Parsing & Normalization: Parse prompt files and normalize shape for execution.
- Execution Engine: Resolve variables and call providers (OpenAI, Azure OpenAI, Anthropic, Meta Llama, Mistral, Cohere, Local).
- Formatting: Output formatters for `markdown`, `html`, `json`, and `plain-text`.
- Diff & Migrate: Compare prompts and upgrade between schema versions.
- Inspect: Extract variables and summarize message roles.

Requires Node.js 18+.

---

## 📦 Installation

```sh
npm install @yuxi-labs/gptp-core
```

---

## � Quick Start (API)

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

- Execute: `npm run gptp:execute` (supports `MOCK=true`)
- Format: `npm run gptp:format`
- Diff: `npm run gptp:diff`
- Init: `npm run gptp:init`
- Migrate: `npm run gptp:migrate`
- Convert: `npm run gptp:convert`

Example (Windows PowerShell):

```powershell
$env:MOCK = 'true'
npm run gptp:execute
```

Notes:
- With `MOCK=true`, model calls return a stubbed response.
- To call OpenAI for real, set `run: true` in `executePrompt` and configure `OPENAI_API_KEY`.

---

## 🧪 Try it (end-to-end)

Below is a minimal flow to run a sample prompt with mocked execution and format the output as markdown.

```powershell
# 1) Install deps
npm install

# 2) Use mocked model responses
$env:MOCK = 'true'

# 3) Execute the hello world example (prints model output)
npm run gptp:execute -- docs/examples/hello-world.gptp name=World

# 4) Format an arbitrary output file (supports markdown/json/html/plain-text)
#    Here we format the raw model output or a string file
#    Example expects output.txt or a JSON with {"content": "..."}
npm run gptp:format -- output.txt --format=markdown
```

If you want to call OpenAI for real, unset `MOCK` and set your API key:

```powershell
Remove-Item Env:MOCK -ErrorAction SilentlyContinue
$env:OPENAI_API_KEY = '<your-key>'
npm run gptp:execute -- docs/examples/hello-world.gptp name=World
```

---

## 🔍 Validation policy

- Fetch schema from the remote URL in `GPTP_SCHEMA_URL` first
- If remote is unavailable, fall back to the local cache at `.gptp/cache/gptp.schema.json`
- If both fail, validation aborts with a clear error message

Example schema URL (v1.2.0):

```text
https://raw.githubusercontent.com/Yuxi-Labs/gptp/refs/tags/v1.2.0/schema/gptp.schema.json
```

---

## ⚙️ Environment variables

| Name               | Purpose                                               | Required |
| ------------------ | ----------------------------------------------------- | -------- |
| `GPTP_SCHEMA_URL`  | Remote URL for GPTP JSON Schema                       | ✅       |
| `GPTP_DEBUG`       | Verbose debug logs (`true`/`false`)                   | ❌       |
| `OPENAI_API_KEY`   | Required when executing with OpenAI (run: true)       | ❌       |

Other providers may require their own keys; see provider implementations under `src/providers/*`.

---

## 📚 API surface

From `@yuxi-labs/gptp-core`:

- `parsePrompt(filePath)` → `Promise<GPTPDocument>`
- `validatePrompt(prompt)` → `Promise<{ valid: boolean; errors: AjvError[]; data?: GPTPDocument }>`
- `normalizePrompt(prompt)` → `GPTPDocument`
- `executePrompt(prompt, { input, run })` → `Promise<{ resolvedMessages, modelOutput }>`
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

MIT © [Yuxi Labs](https://github.com/Yuxi-Labs)