const COLORS = {
    reset: '\x1b[0m',
    gray: '\x1b[90m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
}

export function logInfo(msg: string) {
    console.log(`${COLORS.gray}[info]${COLORS.reset} ${msg}`)
}

export function logWarn(msg: string) {
    console.warn(`${COLORS.yellow}[warn]${COLORS.reset} ${msg}`)
}

export function logError(msg: string) {
    console.error(`${COLORS.red}[error]${COLORS.reset} ${msg}`)
}
