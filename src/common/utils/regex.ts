import RE2 from 're2';

/**
 * Executes a regex test using Google's RE2 engine to prevent ReDoS.
 * RE2 uses a DFA-based approach that guarantees linear time execution.
 * 
 * @param pattern The regex pattern string
 * @param flags The regex flags (e.g., 'i', 'g')
 * @param text The text to test
 * @returns boolean indicating if the pattern matches the text
 */
export function safeTest(pattern: string, flags: string, text: string): boolean {
    try {
        const re = new RE2(pattern, flags);
        return re.test(text);
    } catch (e) {
        console.warn(`Regex evaluation failed for pattern: ${pattern}. Error: ${e}`);
        return false;
    }
}

/**
 * Executes a regex test on multiple strings using RE2.
 * 
 * @param pattern The regex pattern string
 * @param flags The regex flags
 * @param texts Array of strings to test
 * @returns Array of booleans indicating matches
 */
export function safeTestBatch(pattern: string, flags: string, texts: string[]): boolean[] {
    if (texts.length === 0) return [];

    try {
        const re = new RE2(pattern, flags);
        return texts.map(t => re.test(t));
    } catch (e) {
        console.warn(`Batch regex evaluation failed for pattern: ${pattern}. Error: ${e}`);
        // Default to no matches if it fails
        return new Array(texts.length).fill(false);
    }
}
