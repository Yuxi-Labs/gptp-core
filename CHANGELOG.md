# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [0.3.0] - 2025-09-06

### Added
- Provider router integrated into execution; prompts are provider‑agnostic and route via `connections.active`.
- Real adapters with HTTP calls and AbortSignal support: OpenAI, Azure OpenAI, Anthropic, Mistral, Cohere, Meta (via OpenRouter). Local adapter provided for offline testing.
- Normalized provider responses to an OpenAI-like shape for a single read path in `executePrompt`.
- `executePrompt` returns `renderedPromptHash` and `variablesHash` from deterministic render step.
- `.env.example` with all supported env variables; expanded `.env` placeholders.
- Tests for provider router defaults and param mapping.

### Changed
- Lockfile written by execution now includes provider metadata (type/name) and mapped params.
- README updated with provider routing, expanded env vars, Local adapter usage, and corrected examples.

### Fixed
- Removed any MOCK code paths from runtime; production calls are real.

## [0.2.1] - 2025-09-06

### Stability & Tooling
- Deterministic render with hashes; secrets resolver; playground and benchmarking CLIs.
- CI/build hygiene, test stabilization, and documentation improvements.

