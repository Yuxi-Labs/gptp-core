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
    if (raw === null || raw === undefined) {
        return 'null';
    }

    try {
        if (typeof raw === 'object' || typeof raw === 'number' || typeof raw === 'boolean' || raw === null) {
            return JSON.stringify(raw, null, 2);
        }

        if (typeof raw === 'string') {
            return JSON.stringify(raw);
        }

        return JSON.stringify(String(raw));
    } catch (error) {
        console.error('Error formatting as JSON:', error);
        return JSON.stringify({ error: 'Failed to stringify input', reason: (error as Error).message });
    }
}
