// src/devtools/cli/validate.ts

import { parsePrompt } from "../../engine/parse";
import { loadSchema } from "../../engine/schema/loadSchema";
import { validatePrompt } from "../../engine/validate/validatePrompt";
import { logger } from "../../engine/utils/logger";

async function run() {
    const args = process.argv.slice(2);
    const fileArgIndex = args.findIndex((arg) => arg === "--file" || arg === "-f");

    if (fileArgIndex === -1 || !args[fileArgIndex + 1]) {
        console.error("❌ Usage: validate --file <path-to-prompt>");
        process.exit(1);
    }

    const filePath = args[fileArgIndex + 1];

    let prompt;
    try {
        prompt = await parsePrompt(filePath);
    } catch (err) {
        logger.error("validate", `Failed to parse ${filePath}:`, err);
        process.exit(1);
    }

    let schema;
    try {
        schema = await loadSchema();
    } catch (err) {
        logger.error("validate", `Failed to load schema:`, err);
        process.exit(1);
    }

    const result = validatePrompt(prompt, schema);

    if (result.valid) {
        logger.info("validate", `✅ ${filePath} is valid.`);
        process.exit(0);
    } else {
        logger.error("validate", `❌ ${filePath} is invalid. Found ${result.errors?.length} error(s):`);
        for (const err of result.errors || []) {
            console.error(`  - ${err.instancePath}: ${err.message}`);
        }
        process.exit(1);
    }
}

run();
