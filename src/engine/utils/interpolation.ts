/**
 * interpolate.ts
 * Simple variable interpolation utility for GPTP string templates.
 * Replaces {{variable}} with values from context.
 */

export function interpolate(template: string, context: Record<string, unknown>): string {
    return template.replace(/{{\s*([\w\d_-]+)\s*}}/g, (match, key) => {
        const value = context[key];
        return value !== undefined ? String(value) : match;
    });
}

/**
 * Interpolates a batch of strings (e.g. messages).
 */
export function interpolateAll<T>(input: T, context: Record<string, unknown>): T {
    if (typeof input === "string") {
        return interpolate(input, context) as T;
    }

    if (Array.isArray(input)) {
        return input.map((item) => interpolateAll(item, context)) as T;
    }

    if (input && typeof input === "object") {
        const result: any = {};
        for (const key in input) {
            result[key] = interpolateAll(input[key], context);
        }
        return result;
    }

    return input;
}
