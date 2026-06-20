import { describe, it, expect } from 'vitest';
import { jsonToCsv } from '../src/common/utils/csv.js';

describe('jsonToCsv', () => {
    it('returns empty string for empty input', () => {
        expect(jsonToCsv([])).toBe('');
    });

    it('handles simple flat objects', () => {
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
        ];
        const expected = "id,name\n1,Alice\n2,Bob";
        expect(jsonToCsv(data)).toBe(expected);
    });

    it('handles missing values', () => {
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, name: null }
        ];
        // Note: Object keys order is not guaranteed in JS, but usually consistent for insertion order.
        // Assuming 'id', 'name' order.
        // If keys order is different, we can adjust the test.
        // However, usually V8 preserves insertion order for string keys.

        // Let's ensure consistent order by defining keys explicitly if needed, but jsonToCsv uses Object.keys(data[0]).
        // If data[0] has id then name, it uses that order.

        const result = jsonToCsv(data);
        const expected = "id,name\n1,Alice\n2,";
        expect(result).toBe(expected);
    });

    it('handles special characters (commas, quotes, newlines)', () => {
        const data = [
            { id: 1, text: 'Hello, world' },
            { id: 2, text: 'She said "Hi"' },
            { id: 3, text: 'Line 1\nLine 2' }
        ];
        const result = jsonToCsv(data);
        const expected = `id,text
1,"Hello, world"
2,"She said ""Hi"""
3,"Line 1\nLine 2"`;
        expect(result).toBe(expected);
    });

    it('handles undefined values', () => {
        const data = [
            { a: 1, b: undefined },
            { a: 2, b: 3 }
        ];
        // If first row has undefined value, it still has the key if explicitly set to undefined.
        // But if key is missing, Object.keys won't pick it up.
        // If data[0] has keys 'a' and 'b', then headers are 'a','b'.

        const result = jsonToCsv(data);
        const expected = "a,b\n1,\n2,3";
        expect(result).toBe(expected);
    });

    it('collects all unique headers from all objects', () => {
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, age: 30 }
        ];
        const result = jsonToCsv(data);
        const expected = "id,name,age\n1,Alice,\n2,,30";
        expect(result).toBe(expected);
    });

    it('handles non-object rows gracefully without crashing', () => {
        const data: any[] = [
            { id: 1, name: 'Alice' },
            null,
            { id: 2, name: 'Bob' },
            "string"
        ];
        // Only objects should contribute to keys.
        // For non-objects or null, `val === undefined || val === null` logic in row map will output ''
        const result = jsonToCsv(data);
        const expected = "id,name\n1,Alice\n,\n2,Bob\n,";
        expect(result).toBe(expected);
    });
});
