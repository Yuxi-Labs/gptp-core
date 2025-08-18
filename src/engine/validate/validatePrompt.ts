// src/engine/validate/validatePrompt.ts

import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { GPTPDocument, GPTPMessage } from "@/types/gptpTypes";
import { schemaLoader } from "@/utils/schemaLoader";
import type { ValidateFunction } from "ajv";

export interface ValidationResult {
    valid: boolean;
    errors: ErrorObject[];
    data?: GPTPDocument;
}

const ajv = new Ajv({
    strict: true,
    strictTypes: false,
    allowUnionTypes: true,
    allErrors: true,
});
addFormats(ajv);

// 🔁 Cache compiled validator
let validateFn: ValidateFunction | null = null;

async function getValidator(): Promise<ValidateFunction> {
    if (validateFn) return validateFn;

    const schema = await schemaLoader();

    // 🧼 Remove $id to avoid duplicate registration errors
    if (typeof schema === 'object' && schema !== null && '$id' in schema) {
        delete (schema as any)['$id'];
    }

    validateFn = ajv.compile(schema);
    return validateFn;
}

/**
 * Run domain-level validation checks
 */
function runSemanticChecks(doc: GPTPDocument): ErrorObject[] {
    const errors: ErrorObject[] = [];

    if (!Array.isArray(doc.messages) || doc.messages.length === 0) {
        errors.push({
            instancePath: "/messages",
            schemaPath: "#/properties/messages/minItems",
            keyword: "minItems",
            params: { limit: 1 },
            message: "At least one message is required",
        });
    }

    doc.messages?.forEach((msg: GPTPMessage, index: number) => {
        if (!["user", "assistant", "system"].includes(msg.role)) {
            errors.push({
                instancePath: `/messages/${index}/role`,
                schemaPath: "#/properties/messages/items/properties/role/enum",
                keyword: "enum",
                params: {},
                message: `Invalid role: '${msg.role}'`,
            });
        }

        if (!msg.content || typeof msg.content !== "string") {
            errors.push({
                instancePath: `/messages/${index}/content`,
                schemaPath: "#/properties/messages/items/properties/content/type",
                keyword: "type",
                params: {},
                message: "Message content must be a non-empty string",
            });
        }
    });

    if (doc.variables) {
        for (const [name, variable] of Object.entries(doc.variables)) {
            if (!variable.type) {
                errors.push({
                    instancePath: `/variables/${name}`,
                    schemaPath: "#/properties/variables/additionalProperties/required",
                    keyword: "required",
                    params: { missingProperty: "type" },
                    message: `Variable '${name}' is missing a 'type' property`,
                });
            }
        }
    }

    return errors;
}

/**
 * Validates a GPTPDocument against schema + semantic rules.
 */
export async function validatePrompt(prompt: GPTPDocument): Promise<ValidationResult> {
    const validate = await getValidator();

    const isSchemaValid = validate(prompt);
    const schemaErrors = validate.errors ?? [];

    const semanticErrors = runSemanticChecks(prompt);

    const allErrors = [...schemaErrors, ...semanticErrors];

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        data: allErrors.length === 0 ? prompt : undefined,
    };
}
