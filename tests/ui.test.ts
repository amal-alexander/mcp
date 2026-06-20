import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printBoxHeader, printStatusLine, colors } from '../src/utils/ui.js';

describe('UI Utils', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should print box header', () => {
        printBoxHeader('Test Header');
        expect(consoleSpy).toHaveBeenCalledTimes(5);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test Header'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('MCP'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Bing Webmaster Tools'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Amal Alexander'));
    });

    it('should print box header with custom color', () => {
        printBoxHeader('Test Header', colors.green);
        expect(consoleSpy).toHaveBeenCalled();

        const calls = consoleSpy.mock.calls.map((c: any[]) => c[0]);
        const hasGreen = calls.some((c: string) => c.includes(colors.green));
        expect(hasGreen).toBe(true);
    });

    it('should print status line connected', () => {
        printStatusLine('Service', true);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Service connected'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✔'));
    });

    it('should print status line disconnected', () => {
        printStatusLine('Service', false);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Service not connected'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✘'));
    });
});
