// Debugging entry point for the GPTP SDK

import { formatPrompt } from './engine/format/formatPrompt';
import { validatePrompt } from './engine/validate/validatePrompt';

// Example debugging setup
console.log('Starting GPTP SDK debugging environment...');

// Mock data for debugging
const mockPrompt = {
    $doctype: 'gptp',
    schemaVersion: '1.0.0',
    promptVersion: '1.0.0',
    title: 'Debugging Prompt',
    description: 'A prompt for debugging purposes.',
    messages: [
        { role: 'user' as const, content: 'What is the weather today?' }
    ],
    outputFormat: 'markdown' as const,
    outputSchema: undefined
};

const mockModelOutput = {
    content: 'This is a test response from the model.'
};

try {
    // Debugging formatPrompt
    const formattedOutput = formatPrompt(mockModelOutput, mockPrompt);
    console.log('Formatted Output:', formattedOutput);

    // Debugging validatePrompt
    const isValid = validatePrompt(mockPrompt);
    console.log('Validation Result:', isValid);
} catch (error) {
    console.error('Error during debugging:', error);
}
