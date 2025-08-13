import fs from 'fs'

const TOP_LEVEL_ORDER = [
    "$schema",
    "name",
    "description",
    "version",
    "metadata",
    "variables",
    "parameters",
    "messages",
    "output_contract",
    "tests"
]

const NESTED_SORT_KEYS = new Set(["variables", "parameters", "output_contract"])

export function formatGPTPFile(inputPath: string, outputPath?: string): void {
    const raw = fs.readFileSync(inputPath, 'utf-8')
    const original = JSON.parse(raw)

    const formatted = sortGPTPStructure(original)
    const out = JSON.stringify(formatted, null, 2) + '\n'

    if (outputPath) {
        fs.writeFileSync(outputPath, out)
    } else {
        fs.writeFileSync(inputPath, out)
    }
}

export function sortGPTPStructure(data: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {}

    // Sort top-level keys by defined order first
    for (const key of TOP_LEVEL_ORDER) {
        if (key in data) {
            sorted[key] = sortNestedKey(key, data[key])
        }
    }

    // Then include any remaining keys not in the preferred order (alphabetically)
    const remainingKeys = Object.keys(data).filter(k => !TOP_LEVEL_ORDER.includes(k)).sort()
    for (const key of remainingKeys) {
        sorted[key] = sortNestedKey(key, data[key])
    }

    return sorted
}

function sortNestedKey(key: string, value: any): any {
    if (NESTED_SORT_KEYS.has(key) && typeof value === 'object' && !Array.isArray(value)) {
        return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
    }
    return value
}
