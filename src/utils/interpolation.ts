/**
 * interpolation.ts
 * Simple variable interpolation utility for GPTP string templates.
 * Replaces {{variable}} with values from context.
 */

/**
 * Interpolates a single string.
 */
export function interpolate(template: string, context: Record<string, unknown>): string {
    return template.replace(/{{\s*([\w\d_-]+)\s*}}/g, (match, key) => {
        const value = context[key]
        return value !== undefined ? String(value) : match
    })
}

/**
 * Recursively interpolates values inside strings, arrays, and objects.
 * This is the full-fat version.
 */
export function interpolateVariables<T>(input: T, context: Record<string, unknown>): T {
    if (typeof input === 'string') {
        return interpolate(input, context) as T
    }

    if (Array.isArray(input)) {
        return input.map((item) => interpolateVariables(item, context)) as T
    }

    if (input && typeof input === 'object') {
        const result: any = {}
        for (const key in input) {
            result[key] = interpolateVariables((input as any)[key], context)
        }
        return result
    }

    return input
}
