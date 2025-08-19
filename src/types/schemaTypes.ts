// This file contains types related to schema definitions.

export interface SchemaDefinition {
  name: string;
  version: string;
  fields: Record<string, string>;
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors?: string[];
}
