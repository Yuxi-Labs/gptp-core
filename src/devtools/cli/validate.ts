// src/devtools/cli/validate.ts

import { parsePrompt } from "@/engine/parse/parsePrompt";
import { validatePrompt } from "@/engine/validate/validatePrompt";
import { logger } from "@/utils/logger";

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

    let result;
    try {
        result = await validatePrompt(prompt); // ✅ FIXED: only 1 argument
    } catch (err) {
        logger.error("validate", `Failed during validation:`, err);
        process.exit(1);
    }

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
