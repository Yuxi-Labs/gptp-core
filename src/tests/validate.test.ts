import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { test, expect } from 'vitest'
import { validateGPTP } from '../validator/validateGPTP'

test('valid GPTP file passes schema validation', async () => {
    const schemaUrl = process.env.GPTP_SCHEMA_URL
    if (!schemaUrl) throw new Error('Missing GPTP_SCHEMA_URL in .env.local')

    const res = await fetch(schemaUrl) // ✅ real native fetch
    const schema = await res.json()

    const result = await validateGPTP('docs/examples/hello-world.gptp', { schema })

    console.dir(result.errors, { depth: null }) // ✅ show why it failed

    expect(result.valid).toBe(true)
    expect(result.errors).toBeNull()
})
