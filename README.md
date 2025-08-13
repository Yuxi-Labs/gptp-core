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

Core logic for the GPTP file format — including schema validation, formatting, injection, execution, testing and migration — used by tools such as GPTP CLI and GPTP Extension for VS Code in the GPTP Toolkit.

## Features

- Schema validation with AJV + extra checks
- Stable formatter for diffable commits
- Variable injection and dry-run rendering
- Model execution via profiles and environment injection
- Test runner with snapshot support
- Structural diffing
- Migration utilities

## Installation

```bash
npm install @yuxi-labs/gptp-core
````

> This package is designed for internal use by GPTP tooling, but can be used programmatically.

## Example

```ts
import { validateGPTP } from '@yuxi-labs/gptp-core'

const result = await validateGPTP('./docs/examples/hello-world.gptp')

if (!result.valid) {
  console.error(result.errors)
  console.error(result.extraDiagnostics)
}
```

## Repository

[https://github.com/Yuxi-Labs/gptp-core](https://github.com/Yuxi-Labs/gptp-core)

## License

MIT


