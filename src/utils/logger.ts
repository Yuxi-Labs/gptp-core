type LogLevel = "info" | "warn" | "error" | "debug";

function isDebugEnabled(): boolean {
    return process.env.GPTP_DEBUG === "1" || process.env.GPTP_DEBUG === "true";
}

function log(level: LogLevel, tag: string, ...messages: any[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[GPTP][${level.toUpperCase()}][${tag}]`;

    if (level === "debug" && !isDebugEnabled()) return;

    const output = `${timestamp} ${prefix}`;
    const args = [output, ...messages];

    switch (level) {
        case "info":
            console.log(...args)
            break
        case "warn":
            console.warn(...args)
            break
        case "error":
            console.error(...args)
            break
        case "debug":
            console.debug(...args)
            break
    }
}

export const logger = {
    info: (tag: string, ...msg: any[]) => log("info", tag, ...msg),
    warn: (tag: string, ...msg: any[]) => log("warn", tag, ...msg),
    error: (tag: string, ...msg: any[]) => log("error", tag, ...msg),
    debug: (tag: string, ...msg: any[]) => log("debug", tag, ...msg),
}
