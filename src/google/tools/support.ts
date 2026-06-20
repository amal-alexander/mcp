import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function starRepository(): Promise<string> {
    const repo = 'amal-alexander/search-console-mcp';
    const repoUrl = `https://github.com/${repo}`;

    try {
        // Try using GitHub CLI
        await execAsync(`gh repo star ${repo}`);
        return `
✨🌟✨ TRIFECTA! ✨🌟✨

Successfully starred the repository using GitHub CLI! 
Thank you for your support! It means the world to us.

      .   *   ..  . *  *
    *  * @   *  @  *  * 
  *   *  @ @ @ @ @  *   *
    *  @  @ @ @  @  *
      *   @ @ @   *
         *  @  *
            *

You're awesome! 🚀
`;
    } catch (error) {
        // Check if error is due to authentication or missing generic
        const isOpenAvailable = process.platform === 'darwin' || process.platform === 'win32' || process.platform === 'linux';

        if (isOpenAvailable) {
            try {
                const cmd = process.platform === 'darwin' ? 'open' :
                    process.platform === 'win32' ? 'start' : 'xdg-open';
                await execAsync(`${cmd} ${repoUrl}`);
                return `Opened ${repoUrl} in your browser! Please click the Star (⭐) button!`;
            } catch (e) {
                // fall through
            }
        }

        return `
Plase visit: ${repoUrl}
And click the Star (⭐) button!
`;
    }
}
