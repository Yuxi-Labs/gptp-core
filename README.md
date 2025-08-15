# GPTP Core

<p>
  <!-- Build status -->
  <img src="https://img.shields.io/github/actions/workflow/status/Yuxi-Labs/gptp-core/ci.yml?branch=release/v0.0.1" alt="Build Status" />

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

Core SDK for working with **GPTP** (Generative Prompt Template Package) files.  
Provides validation, normalization, execution, and developer tooling for the GPTP file format.  
Designed to be reusable by:

- **CLI tools** (e.g., `gptp-cli`)
- **VS Code extensions**
- **SDK wrappers** (Python, web, etc.)
- **Custom prompt runners and editors**

---

## ✨ Features

- **Schema Validation**  
  Validates `.gptp` files against the official GPTP JSON Schema (v1.2.0)  
  Always prioritizes the remote schema; falls back to local cache only if remote is unavailable.

- **Prompt Normalization**  
  Ensures prompts are well-formed and ready for execution.

- **Execution Engine**  
  Runs GPTP files by resolving variables, injecting context, and calling AI providers.

- **Migration Tools**  
  Upgrade `.gptp` files between schema versions.

- **Diffing**  
  Compare two GPTP files and see changes in variables, messages, and metadata.

- **Pluggable**  
  Hook in custom providers, formatters, or preprocessors.

---

## 📦 Installation

```sh
npm install @yuxi-labs/gptp-core
````

---

## 🗂 Project Structure

```plaintext
src/
  engine/        # Core reusable functionality
    diff/        # Compare GPTP files
    execute/     # Run GPTP files
    format/      # Format prompts
    fs/          # Filesystem helpers
    inspect/     # Inspect GPTP files
    migrate/     # Upgrade GPTP files
    normalize/   # Normalize prompt structure
    parse/       # Parse GPTP JSON
    profile/     # Profile loading/resolution
    schema/      # Load schema from remote or cache
    utils/       # Environment + logging helpers
    validate/    # Validate GPTP files
  devtools/      # Developer helper scripts
  plugins/       # Plugin hooks (future)
  types/         # Shared TypeScript types
```

---

## 🚀 Quick Start

```ts
import { loadSchema } from './engine/schema/loadSchema.js';
import { validatePrompt } from './engine/validate/validatePrompt.js';
import { parsePrompt } from './engine/parse/index.js';
import fs from 'node:fs/promises';

async function main() {
  const schema = await loadSchema();

  const raw = await fs.readFile('./docs/examples/hello-world.gptp', 'utf8');
  const prompt = parsePrompt(raw);

  const { valid, errors } = validatePrompt(prompt, schema);

  if (!valid) {
    console.error('Prompt failed validation:', errors);
    process.exit(1);
  }

  console.log('✅ Prompt is valid!');
}

main().catch(console.error);
```

---

## 🔍 Validation Policy

* **Always fetch schema from remote first** (URL in `GPTP_SCHEMA_URL` env var)
* If remote fails but a local cache exists at `.gptp/cache/gptp.schema.json`, use that
* If neither remote nor cache are available, **fail immediately** with a clear error message
* Never run without a valid schema

---

## ⚙️ Environment Variables

| Variable          | Description                                  | Required |
| ----------------- | -------------------------------------------- | -------- |
| `GPTP_SCHEMA_URL` | URL to the GPTP JSON Schema                  | ✅        |
| `GPTP_DEBUG`      | Enable verbose debug logs (`true` / `false`) | ❌        |

---

## 🧪 Development

### Install dependencies

```sh
npm install
```

### Run tests

```sh
npm test
```

### Run in dev mode

```sh
npm run dev
```

### Run with debug logs

```sh
npm run dev:debug
```

---

## 📜 License

MIT © [Yuxi Labs](https://github.com/Yuxi-Labs)