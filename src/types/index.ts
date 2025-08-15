// src/types/index.ts

export interface GptpVariable {
    type: string;
    description?: string;
    required?: boolean;
    example?: any;
    enum?: string[];
}

export interface GptpMetadata {
    tags?: string[];
    created_by?: string;
    created_at?: string;
    model_compatibility?: string[];
    [key: string]: any;
}

export interface GptpTest {
    name?: string;
    input: Record<string, any>;
    expect?: any;
    expect_contains?: string[];
    expect_exact?: string;
}

export interface GptpVisionInput {
    name: string;
    media_type: string;
    description?: string;
}

export interface GptpPrompt {
    $doctype: 'gptp';
    schemaVersion: string;
    promptVersion: string;
    title: string;
    description: string;
    system?: string;
    variables?: Record<string, GptpVariable>;
    metadata?: GptpMetadata;
    rendering?: {
        style?: 'chat' | 'single-shot' | 'template';
        instructions_position?: 'top' | 'inline' | 'none';
    };
    params?: {
        model?: string;
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
        stop?: string[];
        [key: string]: any;
    };
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    output_format?: 'markdown' | 'json' | 'plain-text' | 'html';
    output_schema?: Record<string, any>;
    connections?: Record<string, any>;
    secrets?: string[];
    assets?: Array<{
        path: string;
        media_type: string;
        purpose?: string;
        description?: string;
    }>;
    tools?: Array<any>;
    vision?: {
        allow_images: boolean;
        inputs: GptpVisionInput[];
    };
    tests?: GptpTest[];
    extends?: string;
}
