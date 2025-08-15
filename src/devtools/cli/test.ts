import { parseTestFlags } from "./helpers/parseFlags";
import { parsePrompt } from "../../engine/parse";
import { normalizePrompt } from "../../engine/normalize";
import { executePrompt } from "../../engine/execute";
import { formatPrompt } from "../../engine/format";
import { logger } from "../../engine/utils/logger";

async function run() {
    const args = process.argv.slice(2);
    const flags = parseTestFlags(args);

    if (!flags.file) {
        console.error("❌ You must specify a prompt file with --file <path>");
        process.exit(1);
    }

    let prompt;
    try {
        prompt = await parsePrompt(flags.file);
    } catch (err) {
        console.error(`❌ Failed to parse ${flags.file}:`, err);
        process.exit(1);
    }

    const normalized = normalizePrompt(prompt);
    const tests = normalized.tests || [];

    if (tests.length === 0) {
        console.warn("⚠️ No tests defined in this prompt.");
        process.exit(0);
    }

    const mode = flags.mode || "non-stop";

    logger.info("test", `🧪 Running ${tests.length} test(s) in ${mode} mode...\n`);

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const name = test.name || "(unnamed)";
        try {
            const result = await executePrompt(normalized, {
                input: test.input,
                run: true,
            });

            const output = result.modelOutput;

            // 🔧 FIXED LINE BELOW: formatPrompt expects format-specific params, not the whole prompt
            const formatted = formatPrompt(output, {
                outputFormat: normalized.params?.outputFormat,
                outputSchema: normalized.params?.outputSchema,
            });

            const pass = matchExpectations(formatted, test);

            if (pass) {
                logger.info("test", `✅ ${name}`);
                passed++;
            } else {
                logger.error("test", `❌ ${name} failed`);
                failed++;

                if (mode === "stop-on-failure") {
                    console.error("\n🛑 Stopping on first failure.");
                    break;
                }

                if (mode === "interactive") {
                    const userInput = await promptContinue();
                    if (!userInput) {
                        console.log("🛑 Aborting remaining tests.");
                        break;
                    }
                }
            }
        } catch (err) {
            logger.error("test", `❌ ${name} threw an error:`, err);
            failed++;

            if (mode !== "non-stop") break;
        }
    }

    console.log(`\n🎯 ${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
}

function matchExpectations(output: string, test: any): boolean {
    if (test.expect_exact) {
        return output.trim() === test.expect_exact.trim();
    }

    if (test.expect_contains) {
        return test.expect_contains.every((snippet: string) =>
            output.includes(snippet)
        );
    }

    return false;
}

async function promptContinue(): Promise<boolean> {
    process.stdout.write("❓ Continue? [y/N] ");
    return new Promise((resolve) => {
        process.stdin.setEncoding("utf8");
        process.stdin.once("data", (data) => {
            const answer = data.toString().trim().toLowerCase();
            resolve(answer === "y" || answer === "yes");
        });
    });
}


run();
