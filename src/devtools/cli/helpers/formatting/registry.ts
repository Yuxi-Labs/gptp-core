import { formatAsMarkdown } from './formatAsMarkdown'
import { formatAsHtml } from './formatAsHtml'
import { formatAsJson } from './formatAsJson'
import { formatAsPlainText } from './formatAsPlainText'

export const formatters = {
    markdown: formatAsMarkdown,
    html: formatAsHtml,
    json: formatAsJson,
    'plain-text': formatAsPlainText
}