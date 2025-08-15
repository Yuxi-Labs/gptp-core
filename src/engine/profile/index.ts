// src/engine/profile/index.ts

import path from 'path';
import fs from 'fs/promises';
import { loadEnvVars } from '../utils/env';

export type GptpProfile = {
    name: string;
    env?: Record<string, string>;
    defaults?: {
        model?: string;
        temperature?: number;
        [key: string]: unknown;
    };
};

/**
 * Loads a .gptp profile by name from `.gptp/profiles/{name}.json`.
 * Loads environment variables into process.env if defined.
 */
export async function loadProfile(name: string = 'default'): Promise<GptpProfile> {
    const profilePath = path.resolve('.gptp', 'profiles', `${name}.json`);

    let raw: string;
    try {
        raw = await fs.readFile(profilePath, 'utf-8');
    } catch (err: any) {
        throw new Error(`Unable to load profile "${name}": ${err.message}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (err: any) {
        throw new Error(`Profile "${name}" contains invalid JSON`);
    }

    const profile = parsed as GptpProfile;

    if (profile.env) {
        loadEnvVars(profile.env);
    }

    return {
        ...profile,
        name, // Ensure the passed-in name always wins
    };
}
