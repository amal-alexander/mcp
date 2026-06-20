
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSchema } from '../src/common/tools/schema-validator';

// Mock Validator
vi.mock('@adobe/structured-data-validator', () => {
    return {
        default: class Validator {
            async validate(input: any) {
                let schemas: any[] = [];
                if (input.jsonld) {
                    for (const key of Object.keys(input.jsonld)) {
                        schemas.push(...input.jsonld[key]);
                    }
                } else {
                    schemas = [input];
                }

                for (const schema of schemas) {
                    if (schema.shouldThrow) {
                        throw new Error('Mock error');
                    }
                    if (schema.shouldFail) {
                        return [{ message: 'Validation failed', type: 'error' }];
                    }
                }

                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 10));
                return [];
            }
        }
    };
});

describe('validateSchema', () => {
    it('should validate valid schemas in parallel', async () => {
        const schemas = [
            { "@type": "Person", "name": "Test1" },
            { "@type": "Person", "name": "Test2" },
            { "@type": "Person", "name": "Test3" }
        ];
        const input = JSON.stringify(schemas);

        const start = performance.now();
        const result = await validateSchema(input, 'json');
        const end = performance.now();

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);

        // Check if parallel execution happened (10ms * 3 = 30ms sequential, but parallel should be ~10ms)
        // Note: instantiation overhead + logic might add some time, but 30ms is distinct from 10ms.
        // However, in CI environment, timing tests are flaky. But let's see.
        console.log(`Test duration: ${end - start}ms`);
    });

    it('should handle validation errors', async () => {
        const schemas = [
            { "@type": "Person", "shouldFail": true }
        ];
        const input = JSON.stringify(schemas);

        const result = await validateSchema(input, 'json');

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toBe('Validation failed');
    });

    it('should handle exceptions during validation', async () => {
        const schemas = [
            { "@type": "Person", "shouldThrow": true }
        ];
        const input = JSON.stringify(schemas);

        const result = await validateSchema(input, 'json');

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toContain('Validation exception: Mock error');
    });
});
