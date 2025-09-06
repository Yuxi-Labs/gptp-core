// src/devtools/benchmarking/runBench.ts
import path from 'node:path'
import * as fs from 'node:fs/promises'
import { performance } from 'node:perf_hooks'

import { parsePrompt } from '@/engine/parse/parsePrompt'
import { validatePrompt } from '@/engine/validate/validatePrompt'
import { normalizePrompt } from '@/engine/normalize/normalizePrompt'
import { executePrompt } from '@/engine/execute/executePrompt'
import { loadEnvFile } from '@/utils/env'
import { logger } from '@/utils/logger'

loadEnvFile()

type BenchResult = {
  start: string
  file: string
  iterations: number
  concurrency: number
  run: boolean
  durationMs: number
  stats: {
    min: number
    p50: number
    p90: number
    p95: number
    p99: number
    max: number
    mean: number
    stddev: number
    successes: number
    failures: number
  }
  errors: Array<{ message: string; count: number }>
}

function parseArgs(argv: string[]) {
  const opts: any = { iters: 50, concurrency: 5, run: false, out: '' }
  const args = [...argv]
  const file = args.shift()
  for (const a of args) {
    if (a.startsWith('--iters=')) opts.iters = parseInt(a.slice(8), 10)
    else if (a.startsWith('--concurrency=')) opts.concurrency = parseInt(a.slice(14), 10)
    else if (a === '--run') opts.run = true
    else if (a.startsWith('--out=')) opts.out = a.slice(6)
  }
  return { file, ...opts }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

function meanStd(values: number[]) {
  if (values.length === 0) return { mean: 0, stddev: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / values.length
  return { mean, stddev: Math.sqrt(variance) }
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function writeJson(filePath: string, data: any) {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

async function main() {
  const [, , maybeFile, ...rest] = process.argv
  const { file, iters, concurrency, run, out } = parseArgs([maybeFile!, ...rest])

  if (!file) {
    console.error('Usage: gptp:bench <prompt.gptp> [--iters=50] [--concurrency=5] [--run] [--out=REPO/BUILD/bench.json]')
    process.exit(1)
  }

  const absPath = path.resolve(file)
  const prompt = await parsePrompt(absPath)
  const validation = await validatePrompt(prompt)
  if (!validation.valid) {
    console.error('❌ Validation failed')
    for (const e of validation.errors || []) console.error('-', e.instancePath, e.message)
    process.exit(1)
  }
  const normalized = normalizePrompt(prompt)

  const iterations = Math.max(1, Number(iters) || 1)
  const conc = Math.max(1, Number(concurrency) || 1)
  const durations: number[] = []
  const errors: Record<string, number> = {}
  let successes = 0
  let failures = 0

  const startOverall = performance.now()

  let next = 0
  async function worker(id: number) {
    while (true) {
      const i = next++
      if (i >= iterations) break
      const t0 = performance.now()
      try {
        await executePrompt(normalized, {
          input: {},
          run,
        })
        const dt = performance.now() - t0
        durations.push(dt)
        successes++
      } catch (err: any) {
        const dt = performance.now() - t0
        durations.push(dt)
        const key = String(err?.message || err)
        errors[key] = (errors[key] || 0) + 1
        failures++
      }
    }
  }

  const workers = Array.from({ length: conc }, (_, i) => worker(i))
  await Promise.all(workers)

  const durationMs = performance.now() - startOverall
  const sorted = durations.slice().sort((a, b) => a - b)
  const { mean, stddev } = meanStd(sorted)
  const result: BenchResult = {
    start: new Date().toISOString(),
    file: path.relative(process.cwd(), absPath),
    iterations,
    concurrency: conc,
    run,
    durationMs,
    stats: {
      min: sorted[0] || 0,
      p50: percentile(sorted, 50),
      p90: percentile(sorted, 90),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
      max: sorted[sorted.length - 1] || 0,
      mean,
      stddev,
      successes,
      failures,
    },
    errors: Object.entries(errors).map(([message, count]) => ({ message, count })),
  }

  // default out path
  const outPath = out || path.join('REPO', 'BUILD', 'benchmarks', `bench-${Date.now()}.json`)
  await writeJson(outPath, result)

  console.log('Benchmark complete:')
  console.log(`  file: ${result.file}`)
  console.log(`  iterations: ${iterations}  concurrency: ${conc}  run: ${run}`)
  console.log(`  total: ${durationMs.toFixed(1)} ms`)
  console.log('  stats:')
  console.log(`    min=${result.stats.min.toFixed(2)}  p50=${result.stats.p50.toFixed(2)}  p90=${result.stats.p90.toFixed(2)}  p95=${result.stats.p95.toFixed(2)}  p99=${result.stats.p99.toFixed(2)}  max=${result.stats.max.toFixed(2)}  mean=${result.stats.mean.toFixed(2)}  stddev=${result.stats.stddev.toFixed(2)}`)
  if (failures) {
    console.log(`  errors (${failures}):`)
    for (const e of result.errors) console.log('   -', e.count, e.message)
  }
  console.log(`  wrote: ${path.resolve(outPath)}`)
}

main().catch((err) => {
  logger.error('[bench]', err)
  process.exit(1)
})
