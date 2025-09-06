import path from 'path';
import { parsePrompt } from '@/engine/parse/parsePrompt';
import { getDeclaredVariables, getRequiredVariables } from '@/engine/inspect/inspectPrompt';

async function run(): Promise<void> {
    const [, , filePath] = process.argv;

    if (!filePath) {
        console.error('Usage: gptp inspect <prompt.gptp>');
        process.exit(1);
    }

    const absPath = path.resolve(filePath);

    let parsedPrompt;
    try {
        parsedPrompt = await parsePrompt(absPath);
    } catch (err: any) {
        console.error(`❌ Failed to parse the prompt file: ${err.message}`);
        process.exit(1);
    }

    const declaredVariables = getDeclaredVariables(parsedPrompt);
    const requiredVariables = getRequiredVariables(parsedPrompt);

    console.log('=== Prompt Inspection ===\n');
    console.log('Declared Variables:');
    console.log(declaredVariables.length > 0 ? declaredVariables.join(', ') : 'None');

    console.log('\nRequired Variables:');
    console.log(requiredVariables.length > 0 ? requiredVariables.join(', ') : 'None');
}

run().catch(err => {
    console.error(`❌ Unexpected error: ${err.message}`);
    process.exit(1);
});
