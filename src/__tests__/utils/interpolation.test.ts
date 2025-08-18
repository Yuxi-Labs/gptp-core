// src/__tests__/utils/interpolation.test.ts

import { describe, it, expect } from 'vitest'
import {
    interpolate,
    interpolateVariables
} from '@/utils/interpolation'

describe('interpolation.ts', () => {
    describe('interpolate()', () => {
        it('should replace a single variable', () => {
            const result = interpolate('Hello, {{name}}!', { name: 'Alice' })
            expect(result).toBe('Hello, Alice!')
        })

        it('should replace multiple variables', () => {
            const result = interpolate('Hi {{first}}, your ID is {{id}}', {
                first: 'Bob',
                id: 42,
            })
            expect(result).toBe('Hi Bob, your ID is 42')
        })

        it('should ignore missing variables and leave them untouched', () => {
            const result = interpolate('Hello, {{ghost}}!', {})
            expect(result).toBe('Hello, {{ghost}}!')
        })

        it('should trim whitespace around variable names', () => {
            const result = interpolate('Welcome, {{ name }}!', { name: 'Eve' })
            expect(result).toBe('Welcome, Eve!')
        })

        it('should handle non-string values gracefully', () => {
            const result = interpolate('You have {{count}} new messages', {
                count: 3,
            })
            expect(result).toBe('You have 3 new messages')
        })
    })

    describe('interpolateVariables()', () => {
        it('should recursively interpolate strings in an object', () => {
            const input = {
                greeting: 'Hello {{user}}',
                details: {
                    message: 'You have {{count}} items',
                },
            }

            const result = interpolateVariables(input, {
                user: 'Charlie',
                count: 12,
            })

            expect(result).toEqual({
                greeting: 'Hello Charlie',
                details: {
                    message: 'You have 12 items',
                },
            })
        })

        it('should handle arrays with interpolated values', () => {
            const input = ['Item: {{name}}', 'Qty: {{qty}}']
            const result = interpolateVariables(input, {
                name: 'Widget',
                qty: 5,
            })

            expect(result).toEqual(['Item: Widget', 'Qty: 5'])
        })

        it('should leave primitives untouched', () => {
            expect(interpolateVariables(42, {})).toBe(42)
            expect(interpolateVariables(true, {})).toBe(true)
        })

        it('should handle nested arrays and objects', () => {
            const input = {
                list: [
                    'Hello {{name}}',
                    { inner: 'Your ID is {{id}}' },
                ],
            }

            const context = {
                name: 'Dora',
                id: 99,
            }

            const result = interpolateVariables(input, context)

            expect(result).toEqual({
                list: [
                    'Hello Dora',
                    { inner: 'Your ID is 99' },
                ],
            })
        })

        it('should not mutate the original input', () => {
            const input = { msg: 'Hi {{name}}' }
            const clone = JSON.parse(JSON.stringify(input))

            interpolateVariables(input, { name: 'Neo' })
            expect(input).toEqual(clone)
        })
    })
})
