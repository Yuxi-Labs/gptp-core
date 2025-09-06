import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        include: [
            'src/__tests__/utils/**/*.test.ts',
            'src/__tests__/engine/**/*Prompt.test.ts',
            'src/__tests__/providers/**/*.test.ts',
            'src/__tests__/constants/**/*.test.ts',
            'src/__tests__/api/**/*.test.ts',
            'src/__tests__/runtime/**/*.test.ts',
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
})
