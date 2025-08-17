// src/devtools/cli/helpers/formatting/formatAsJson.ts

/**
 * formatAsJson
 *
 * Converts model output into JSON format — always valid JSON, never approximate.
 * This formatter is for downstream systems or humans that want structured data.
 * If the input is already an object, it is stringified.
 * If the input is a string, it is wrapped as a JSON string value.
 * If input is undefined, the string "null" is returned (since JSON has no undefined).
 * Fails gracefully — never throws.
 */

export function formatAsJson(raw: any): string {
    // Handle undefined explicitly — JSON doesn't support it
    if (typeof raw === 'undefined') {
        return 'null'
    }

    try {
        // If it's an object, array, boolean, number, or null — safe to JSON.stringify
        if (typeof raw === 'object' || typeof raw === 'number' || typeof raw === 'boolean' || raw === null) {
            return JSON.stringify(raw, null, 2)
        }

        // If it's a string — wrap as a JSON string literal
        if (typeof raw === 'string') {
            return JSON.stringify(raw) // adds quotes + escapes
        }

        // Fallback for other primitive types
        return JSON.stringify(String(raw))
    } catch (err) {
        return JSON.stringify({ error: 'Failed to stringify input', reason: (err as Error).message })
    }
}
