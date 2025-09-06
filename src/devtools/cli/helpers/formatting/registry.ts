import { formatAsMarkdown } from './formatAsMarkdown';
import { formatAsHtml } from './formatAsHtml';
import { formatAsJson } from './formatAsJson';
import { formatAsPlainText } from './formatAsPlainText';

export const formatters = {
    markdown: formatAsMarkdown,
    html: formatAsHtml,
    json: formatAsJson,
    'plain-text': formatAsPlainText,
};

export function getFormatter(format: string) {
    const formatter = formatters[format as keyof typeof formatters];
    if (!formatter) {
        throw new Error(`Unsupported formatter: ${format}`);
    }
    return formatter;
}