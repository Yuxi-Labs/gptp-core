// src/devtools/cli/helpers/formatting/formatAsHtml.ts

/**
 * formatAsHtml
 *
 * Converts model output into a valid HTML document or fragment.
 * This is not meant to render a full UI — it’s focused on producing safe,
 * readable HTML from string or structured output.
 */

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function formatJsonToHtml(obj: unknown): string {
    const json = JSON.stringify(obj, null, 2)
    const escaped = escapeHtml(json)
    return `<pre><code class="json">${escaped}</code></pre>`
}

export function formatAsHtml(raw: any): string {
    if (typeof raw === 'string') {
        const escaped = escapeHtml(raw)
        return `<pre><code>${escaped}</code></pre>`
    }

    if (
        typeof raw === 'number' ||
        typeof raw === 'boolean' ||
        raw === null
    ) {
        return `<pre><code>${escapeHtml(String(raw))}</code></pre>`
    }

    if (typeof raw === 'undefined') {
        return `<pre><code class="undefined">[undefined]</code></pre>`
    }

    try {
        return formatJsonToHtml(raw)
    } catch {
        return `<pre><code class="error">[Error: Failed to stringify output]</code></pre>`
    }
}
