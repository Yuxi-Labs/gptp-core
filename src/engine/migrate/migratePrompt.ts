import { cloneDeep } from 'lodash-es'

// Future-proof wrapper
export function migratePrompt(original: any): any {
    const currentVersion = original?.schemaVersion ?? 'unknown'

    if (currentVersion === '1.2.0') {
        return original // No migration needed
    }

    return migrateTo120(original)
}

// Migrate from anything → 1.2.0 (because we only support one schema like cowards)
export function migrateTo120(original: any): any {
    const migrated = cloneDeep(original)

    // === Required fields ===
    migrated.$doctype = 'gptp'
    migrated.schemaVersion = '1.2.0'

    // === Rename legacy fields ===
    if (migrated.version && !migrated.promptVersion) {
        migrated.promptVersion = migrated.version
        delete migrated.version
    }

    if (migrated.output_contract && !migrated.output_schema) {
        migrated.output_schema = migrated.output_contract
        delete migrated.output_contract
    }

    if (migrated.parameters && !migrated.params) {
        migrated.params = migrated.parameters
        delete migrated.parameters
    }

    // === Fix variables shape (legacy array → object) ===
    if (Array.isArray(migrated.variables)) {
        const obj: Record<string, any> = {}
        for (const item of migrated.variables) {
            if (item?.name) {
                obj[item.name] = item
            }
        }
        migrated.variables = obj
    }

    // === Default values (just in case someone gets lazy) ===
    migrated.promptVersion = migrated.promptVersion || '1.0.0'
    migrated.metadata = migrated.metadata || {}

    return migrated
}
