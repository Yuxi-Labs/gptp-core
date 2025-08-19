export interface GPTPDocument {
    $doctype: string; // Can carry values like 'gptp' or 'GPTP'
    schemaVersion: string;
    promptVersion: string;
    title: string;
    description: string;
    system?: string;
    messages: GPTPMessage[];
    variables?: Record<string, GPTPVariable>;
    metadata?: GPTPMetadata;
    rendering?: GPTRendering;
    output_format?: 'markdown' | 'json' | 'plain-text' | 'html';
    output_schema?: Record<string, unknown>;
    params?: GPTPParams;
    connections?: GPTPConnections;
    assets?: GPTPAsset[];
    license?: string;
    usage_notes?: string;
    provenance?: GPTPProvenance;
    secrets?: string[];
    tools?: GPTPTool[];
    vision?: GPTPVision;
    tests?: GPTPTest[];
    extends?: string;
    [key: string]: unknown; // optional for patternProps / x-keys
}

export interface GPTPMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GPTPVariable {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
    description?: string;
    example?: unknown;
    enum?: Array<string | number | boolean>;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    default?: unknown;
    [key: string]: unknown;
}

export interface GPTPMetadata {
    tags?: string[];
    created_by?: string;
    created_at?: string; // ISO date-time
    model_compatibility?: string[];
    [key: string]: unknown;
}

export interface GPTRendering {
    style?: 'chat' | 'single-shot' | 'template';
    instructions_position?: 'top' | 'inline' | 'none';
}

export interface GPTPParams {
    model?: string;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stop?: string | string[];
    seed?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}

export interface GPTPConnections {
    active?: string;
    providers?: Record<string, {
        type?: string;
        endpoint?: string;
        deployment?: string;
        api_key?: string;
    }>;
}

export interface GPTPAsset {
    path: string;
    media_type?: string;
    purpose?: 'context' | 'example' | 'citation' | 'other';
    description?: string;
}


export interface GPTPProvenance {
    sha256?: string;
    signature?: string;
}

export interface GPTPTool {
    name: string;
    description?: string;
    parameters_schema?: Record<string, unknown>;
}


export interface GPTPVision {
    allow_images?: boolean;
    inputs?: Array<{
        name: string;
        media_type: string;
        description?: string;
    }>;
}

export interface GPTPTest {
    name?: string;
    input: Record<string, unknown>;
    expect_contains?: string[];
    expect_exact?: string;
    expect_json_schema?: object;
    expect?: string | number | object | boolean | null;
    [key: string]: unknown;
}
