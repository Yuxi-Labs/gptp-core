// src/engine/validate/validatePrompt.ts

import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";

export interface ValidationResult {
    valid: boolean;
    errors?: ErrorObject[] | null;
}

export function validatePrompt(prompt: unknown, schema: object): ValidationResult {
    const ajv = new Ajv({
        strict: true,
        strictTypes: false,      // ✅ Fix for enum type issues
        allowUnionTypes: true,   // ✅ Fix for schema with mixed enums
        allErrors: true,
    });

    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(prompt);

    return {
        valid,
        errors: validate.errors,
    };
}
