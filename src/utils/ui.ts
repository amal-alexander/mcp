/**
 * Shared CLI UI utilities for MCP by Amal Alexander
 */

export const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    cyan: "\x1b[36m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
};

export function printBoxHeader(subLabel: string, color = colors.blue) {
    const totalWidth = 60;

    const line1Plain = `MCP - ${subLabel}`;
    const line1Styled = `${colors.bold}${colors.cyan}MCP${colors.reset} ${colors.dim}-${colors.reset} ${colors.magenta}${subLabel}${colors.reset}`;

    const line2Plain = `GSC · Google Analytics 4 · Bing Webmaster Tools`;
    const line2Styled = `${colors.dim}GSC${colors.reset} ${colors.yellow}·${colors.reset} ${colors.dim}Google Analytics 4${colors.reset} ${colors.yellow}·${colors.reset} ${colors.dim}Bing Webmaster Tools${colors.reset}`;

    const line3Plain = `Built by Amal Alexander`;
    const line3Styled = `${colors.dim}Built by${colors.reset} ${colors.green}${colors.bold}Amal Alexander${colors.reset}`;

    const formatRow = (plainText: string, styledText: string) => {
        const padding = totalWidth - plainText.length;
        const left = Math.floor(padding / 2);
        const right = padding - left;
        return `${colors.bold}${color}│${colors.reset}${" ".repeat(left)}${styledText}${" ".repeat(right)}${colors.bold}${color}│${colors.reset}`;
    };

    console.error(`\n${colors.bold}${color}╭────────────────────────────────────────────────────────────╮${colors.reset}`);
    console.error(formatRow(line1Plain, line1Styled));
    console.error(formatRow(line2Plain, line2Styled));
    console.error(formatRow(line3Plain, line3Styled));
    console.error(`${colors.bold}${color}╰────────────────────────────────────────────────────────────╯${colors.reset}\n`);
}

export function printStatusLine(label: string, isConnected: boolean) {
    if (isConnected) {
        console.error(`  ${colors.green}✔${colors.reset} ${label} connected`);
    } else {
        console.error(`  ${colors.red}✘${colors.reset} ${label} not connected`);
    }
}
