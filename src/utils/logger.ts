/**
 * Logging utility for Search Console MCP.
 * Since this is a stdio-based MCP server, we must log to stderr
 * to avoid interfering with the MCP protocol on stdout.
 */

import { colors } from './ui.js';

const isDebugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

export const logger = {
    /**
     * Log a debug message. Only visible if DEBUG=true or NODE_ENV=development.
     */
    debug(message: string, ...args: any[]) {
        if (isDebugEnabled) {
            const timestamp = new Date().toISOString();
            console.error(
                `${colors.dim}[${timestamp}]${colors.reset} ${colors.blue}[DEBUG]${colors.reset} ${message}`,
                ...args
            );
        }
    },

    /**
     * Log an error message. Always visible.
     */
    error(message: string, error?: any) {
        const timestamp = new Date().toISOString();
        console.error(
            `${colors.dim}[${timestamp}]${colors.reset} ${colors.red}[ERROR]${colors.reset} ${message}`,
            error || ''
        );
    },

    /**
     * Log an info message. Always visible.
     */
    info(message: string, ...args: any[]) {
        const timestamp = new Date().toISOString();
        console.error(
            `${colors.dim}[${timestamp}]${colors.reset} ${colors.green}[INFO]${colors.reset} ${message}`,
            ...args
        );
    },

    /**
     * Log a warning message. Always visible.
     */
    warn(message: string, ...args: any[]) {
        const timestamp = new Date().toISOString();
        console.error(
            `${colors.dim}[${timestamp}]${colors.reset} ${colors.yellow}[WARN]${colors.reset} ${message}`,
            ...args
        );
    }
};
