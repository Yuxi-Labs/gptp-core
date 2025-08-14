import { readFile } from 'fs/promises'
import { resolve, isAbsolute } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export async function validateGPTP(
    filePath: string,
    opts: {
        schema: object
    }
) {
    const ajv = new Ajv({ allErrors: true, strict: false })
    addFormats(ajv)

    const absPath = isAbsolute(filePath)
        ? filePath
        : resolve(process.cwd(), filePath)

    const raw = await readFile(absPath, 'utf8')
    const data = JSON.parse(raw)

    const validate = ajv.compile(opts.schema)
    const valid = validate(data)

    return {
        valid,
        errors: validate.errors ?? null
    }
}
