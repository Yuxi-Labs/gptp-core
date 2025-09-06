// src/__tests__/utils/fileLoader.test.ts

import { describe, it, beforeEach, afterEach, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
    isGptpFile,
    readGptpFile,
    writeGptpFile
} from '@/utils/fileLoader'

const TEST_DIR = path.resolve(__dirname, '__temp__')
const VALID_FILE = path.join(TEST_DIR, 'test.gptp')
const INVALID_EXT = path.join(TEST_DIR, 'invalid.txt')
const INVALID_JSON_FILE = path.join(TEST_DIR, 'broken.gptp')

beforeEach(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true })
})

afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('fileLoader', () => {
    describe('isGptpFile()', () => {
        it('should return true for .gptp file', () => {
            expect(isGptpFile('prompt.gptp')).toBe(true)
        })

        it('should return false for non-.gptp file', () => {
            expect(isGptpFile('prompt.json')).toBe(false)
            expect(isGptpFile('banana.txt')).toBe(false)
        })
    })

    describe('readGptpFile()', () => {
        it('should read and parse a valid .gptp file', () => {
            const sampleData = { title: 'Hello World GPTP', version: 1 }
            fs.writeFileSync(VALID_FILE, JSON.stringify(sampleData, null, 2), 'utf8')
            const result = readGptpFile(VALID_FILE)
            expect(result).toEqual(sampleData)
        })

        it('should throw if file does not exist', () => {
            expect(() => readGptpFile('missing.gptp')).toThrowError(/GPTP file not found/)
        })

        it('should throw if file extension is not .gptp', () => {
            fs.writeFileSync(INVALID_EXT, '{}', 'utf8')
            expect(() => readGptpFile(INVALID_EXT)).toThrowError(/Expected a .gptp file/)
        })

        it('should throw if file contains invalid JSON', () => {
            fs.writeFileSync(INVALID_JSON_FILE, '{not: valid json', 'utf8')
            expect(() => readGptpFile(INVALID_JSON_FILE)).toThrowError(/Invalid JSON/)
        })
    })

    describe('writeGptpFile()', () => {
        it('should write JSON to a .gptp file', () => {
            const data = { hello: 'world' }
            writeGptpFile(VALID_FILE, data)
            const written = fs.readFileSync(VALID_FILE, 'utf8')
            expect(JSON.parse(written)).toEqual(data)
        })

        it('should throw if file extension is not .gptp', () => {
            expect(() => writeGptpFile(INVALID_EXT, {})).toThrowError(/Expected a .gptp file/)
        })
    })
})
