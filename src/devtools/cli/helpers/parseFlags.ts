// src/devtools/cli/helpers/parseFlags.ts

export type TestRunMode = "non-stop" | "stop-on-failure" | "interactive";

export interface TestFlags {
    file?: string;             // Path to a .gptp file
    only?: string;             // Test name to focus on
    mode?: TestRunMode;        // Control run behavior
    snapshot?: boolean;        // Enable snapshot comparison
    verbose?: boolean;         // Extra output
}

export function parseTestFlags(args: string[]): TestFlags {
    const flags: TestFlags = {};
    const consumed = new Set<number>();

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--file" || arg === "-f") {
            flags.file = args[i + 1];
            consumed.add(i);
            consumed.add(i + 1);
            i++;
        }

        else if (arg === "--only") {
            flags.only = args[i + 1];
            consumed.add(i);
            consumed.add(i + 1);
            i++;
        }

        else if (arg === "--mode") {
            const val = args[i + 1];
            if (["non-stop", "stop-on-failure", "interactive"].includes(val)) {
                flags.mode = val as TestRunMode;
            } else {
                throw new Error(`Unknown test mode: ${val}`);
            }
            consumed.add(i);
            consumed.add(i + 1);
            i++;
        }

        else if (arg === "--snapshot") {
            flags.snapshot = true;
            consumed.add(i);
        }

        else if (arg === "--verbose" || arg === "-v") {
            flags.verbose = true;
            consumed.add(i);
        }
    }

    // Detect unknown flags
    const unknowns = args.filter((_, i) => !consumed.has(i) && args[i].startsWith("-"));
    if (unknowns.length > 0) {
        throw new Error(`Unknown flag(s): ${unknowns.join(", ")}`);
    }

    return flags;
}
