import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
const AUTH_FILE_DIR = path.join(os.homedir(), '.lazy-bot');
const AUTH_FILE_PATH = path.join(AUTH_FILE_DIR, 'auth.json');
class AuthService {
    async init() {
        try {
            const authData = await fs
                .readFile(AUTH_FILE_PATH, 'utf-8')
                .catch(() => null);
            if (authData) {
                let parsed = JSON.parse(authData);
                if (parsed.token && !parsed.accounts) {
                    parsed = {
                        activeToken: parsed.token,
                        accounts: [{ token: parsed.token, user: parsed.user }],
                    };
                    await fs
                        .writeFile(AUTH_FILE_PATH, JSON.stringify(parsed, null, 2))
                        .catch(() => null);
                }
                if (parsed.activeToken &&
                    parsed.accounts &&
                    parsed.accounts.length > 0) {
                    const activeAccount = parsed.accounts.find((a) => a.token === parsed.activeToken) ||
                        parsed.accounts[0];
                    try {
                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), 3000);
                        const apiUrl = global.API_BASE_URL.replace(/\/$/, '');
                        const response = await fetch(`${apiUrl}/api/user`, {
                            method: 'GET',
                            headers: {
                                Accept: 'application/json',
                                Authorization: `Bearer ${activeAccount.token}`,
                            },
                            signal: controller.signal,
                        });
                        clearTimeout(timeout);
                        if (response.status === 401) {
                            parsed.accounts = parsed.accounts.filter((a) => a.token !== activeAccount.token);
                            if (parsed.accounts.length > 0) {
                                parsed.activeToken = parsed.accounts[0].token;
                                await fs
                                    .writeFile(AUTH_FILE_PATH, JSON.stringify(parsed, null, 2))
                                    .catch(() => null);
                            }
                            else {
                                await fs.unlink(AUTH_FILE_PATH).catch(() => null);
                            }
                        }
                        else if (response.ok) {
                            const userData = (await response.json().catch(() => null));
                            global.AUTH_TOKEN = activeAccount.token;
                            global.AUTH_USER = userData || activeAccount.user || null;
                            if (global.AUTH_USER) {
                                const index = parsed.accounts.findIndex((a) => a.token === activeAccount.token);
                                if (index !== -1) {
                                    parsed.accounts[index].user = global.AUTH_USER;
                                }
                                await fs
                                    .writeFile(AUTH_FILE_PATH, JSON.stringify(parsed, null, 2))
                                    .catch(() => null);
                            }
                        }
                        else {
                            global.AUTH_TOKEN = activeAccount.token;
                            global.AUTH_USER = activeAccount.user || null;
                        }
                    }
                    catch (e) {
                        global.AUTH_TOKEN = activeAccount.token;
                        global.AUTH_USER = activeAccount.user || null;
                    }
                }
            }
        }
        catch {
        }
    }
}
export default new AuthService();
