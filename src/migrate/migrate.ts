import fs from 'fs'
import path from 'path'

export interface MigrationOptions {
    fromVersion?: string
    toVersion: string
    schemaUrl?: string
    dryRun?: boolean
}

export function migrateGPTP(inputPath: string, outputPath: string | undefined, options: MigrationOptions): void {
    const raw = fs.readFileSync(inputPath, 'utf-8')
    const data = JSON.parse(raw)

    const currentVersion = data.version ?? options.fromVersion
    const targetVersion = options.toVersion

    if (currentVersion === targetVersion) {
        console.log(`Already at version ${targetVersion}. No migration needed.`)
        return
    }

    const migrated = applyMigrationSteps(data, currentVersion, targetVersion, options.schemaUrl)

    const output = JSON.stringify(migrated, null, 2) + '\n'

    if (options.dryRun) {
        console.log(output)
    } else {
        const targetPath = outputPath ?? inputPath
        fs.writeFileSync(targetPath, output)
        console.log(`Migrated GPTP file to version ${targetVersion}.`)
    }
}

function applyMigrationSteps(data: any, from: string | undefined, to: string, schemaUrl?: string): any {
    const upgraded = structuredClone(data)

    // Example: migrate v1.0.0 to v1.1.0
    if (from === '1.0.0' && to === '1.1.0') {
        // Add empty `parameters` block if missing
        if (!('parameters' in upgraded)) {
            upgraded.parameters = {}
        }

        // Move provider to metadata.target if needed
        if (upgraded.metadata?.provider && !upgraded.metadata.target) {
            upgraded.metadata.target = upgraded.metadata.provider
            delete upgraded.metadata.provider
        }
    }

    // Set new version and schema
    upgraded.version = to
    upgraded.$schema = schemaUrl ?? `https://raw.githubusercontent.com/Yuxi-Labs/gptp/refs/tags/v${to}/schema/gptp.schema.json`

    return upgraded
}
