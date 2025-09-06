// src/devtools/playground/runPlayground.ts
import path from 'node:path'
import { parsePrompt } from '@/engine/parse/parsePrompt'
import { validatePrompt } from '@/engine/validate/validatePrompt'
import { normalizePrompt } from '@/engine/normalize/normalizePrompt'
import { executePrompt } from '@/engine/execute/executePrompt'
import { loadEnvFile } from '@/utils/env'

loadEnvFile()

function parseKV(args: string[]) {
  const out: Record<string, unknown> = {}
  for (const a of args) {
    const i = a.indexOf('=')
    if (i > 0) out[a.slice(0, i)] = a.slice(i + 1)
  }
  return out
}

async function main() {
  const [, , file, ...kv] = process.argv
  if (!file) {
    console.error('Usage: gptp:play <prompt.gptp> key=value ...')
    process.exit(1)
  }

  const prompt = await parsePrompt(path.resolve(file))
  const validation = await validatePrompt(prompt)
  if (!validation.valid) {
    console.error('❌ Validation failed', validation.errors)
    process.exit(1)
  }
  const normalized = normalizePrompt(prompt)
  const input = parseKV(kv)

  const res = await executePrompt(normalized, { input, run: true })
  console.log('--- resolvedMessages ---')
  console.log(JSON.stringify(res.resolvedMessages, null, 2))
  console.log('--- hashes ---')
  console.log({ renderedPromptHash: res.renderedPromptHash, variablesHash: res.variablesHash })
  console.log('--- modelOutput ---')
  console.log(res.modelOutput)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
