// src/engine/migrate/index.ts

import { cloneDeep } from 'lodash';

export function migrateTo120(original: any): any {
    const migrated = cloneDeep(original);

    // Add core fields
    migrated.$doctype = 'gptp';
    migrated.schemaVersion = '1.2.0';

    // Rename version → promptVersion if present
    if (migrated.version && !migrated.promptVersion) {
        migrated.promptVersion = migrated.version;
        delete migrated.version;
    }

    // Rename output_contract → output_schema
    if (migrated.output_contract && !migrated.output_schema) {
        migrated.output_schema = migrated.output_contract;
        delete migrated.output_contract;
    }

    // Rename parameters → params
    if (migrated.parameters && !migrated.params) {
        migrated.params = migrated.parameters;
        delete migrated.parameters;
    }

    // Fix variable structure if it's an array
    if (Array.isArray(migrated.variables)) {
        const obj: Record<string, any> = {};
        for (const item of migrated.variables) {
            if (item?.name) obj[item.name] = item;
        }
        migrated.variables = obj;
    }

    return migrated;
}

/**
 * Wrapper for future version support.
 * Migrates a prompt to the latest schema version.
 */
export function migratePrompt(original: any): any {
    // Right now we only support migration to 1.2.0
    return migrateTo120(original);
}
