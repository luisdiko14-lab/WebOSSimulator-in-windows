const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto'); // Built-in Node module for secure random generation
require('dotenv').config();

// Note: Using native fetch (requires Node.js v18+)

const app = express();
const PORT = 5000;

/* =======================
   🎨 COLOR LOG SYSTEM
======================= */
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    fg: {
        green: "\x1b[32m",
        red: "\x1b[31m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        cyan: "\x1b[36m"
    }
};

const time = () => new Date().toLocaleTimeString();

const log = {
    info: (msg) => console.log(`${colors.fg.blue}[INFO ${time()}]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.fg.green}[SUCCESS ${time()}]${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.fg.yellow}[WARN ${time()}]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.fg.red}[ERROR ${time()}]${colors.reset} ${msg}`)
};

/* =======================
   🛡️ SECURITY & MIDDLEWARE
======================= */
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false, // Safer: only saves when session is modified
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day limit
}));

// SECURITY SHIELD: Blocks access to sensitive files while serving the rest of the root directory
app.use((req, res, next) => {
    const forbiddenExts = ['.env','.jsxx'];
    if (forbiddenExts.some(ext => req.path.endsWith(ext)) && req.path !== '/') {
        log.warn(`Blocked access attempt to sensitive file: ${req.path}`);
        return res.status(403).send('403 Forbidden: Access to this file type is restricted.');
    }
    next();
});

// Serve the root directory as requested
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



// Middleware (important for POST)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ GET route (fixed & safer)
app.get('/windows_defender', (req, res) => {
    const filePath = path.join(__dirname, 'windows_defender.html');

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('[ERROR] Failed to send windows_defender.html:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('[INFO] windows_defender.html served successfully');
        }
    });
});

// ✅ POST route → ping Replit
app.post('/windows_defender', async (req, res) => {
    try {
        const response = await fetch('https://replit.com/ping?=true', {
            method: 'POST'
        });

        console.log('[INFO] Ping sent to Replit:', response.status);

        res.json({
            success: true,
            status: response.status
        });

    } catch (error) {
        console.error('[ERROR] Failed to ping Replit:', error);

        res.status(500).json({
            success: false,
            error: 'Ping failed'
        });
    }
});

/* =======================
   🔑 ENV & HELPERS
======================= */
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1370655950310080522';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://dc97442b-2e83-447c-806e-1718dc226361-00-ry3rm930k0c5.worf.replit.dev/api/auth/discord-callback';

// Generates an exact 55-character cryptographically secure random string
const generate55CharState = () => {
    return crypto.randomBytes(40).toString('hex').substring(0, 55);
};

/* =======================
   🔗 ROUTES
======================= */
// Always build the redirect URI from the request headers — never trust a misconfigured env var
function getRedirectUri(req) {
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${proto}://${host}/api/auth/discord-callback`;
}

app.get('/api/auth/discord', (req, res) => {
    const state = generate55CharState();
    req.session.oauthState = state;
    req.session.save(); // force session save before redirect

    const redirectUri = getRedirectUri(req);
    log.info(`Starting Discord OAuth flow. redirect_uri: ${redirectUri}`);

    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'identify guilds',
        state: state
    });

    res.redirect(`https://discord.com/api/v10/oauth2/authorize?${params.toString()}`);
});

/* ─────────────────────────────────────────────────────────────────
   SHARED: exchange a Discord code for user data, store in session
───────────────────────────────────────────────────────────────── */
async function exchangeDiscordCode(code, req) {
    const dynamicRedirectUri = getRedirectUri(req);
    log.info(`Exchanging Discord code... redirect_uri: ${dynamicRedirectUri}`);

    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: dynamicRedirectUri
        })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
        const msg = tokenData.error_description || tokenData.error || 'Unknown Discord error';
        log.error(`Token exchange failed: ${msg}`);
        throw new Error(msg);
    }

    log.success('Access token received!');

    const [userResponse, guildsResponse] = await Promise.allSettled([
        fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        }),
        fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        })
    ]);

    const discordUser = userResponse.status === 'fulfilled' ? await userResponse.value.json() : {};
    let guildsData = [];
    if (guildsResponse.status === 'fulfilled') {
        const raw = await guildsResponse.value.json();
        guildsData = Array.isArray(raw) ? raw.slice(0, 10) : [];
    }

    const sessionUser = {
        id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator || '0',
        email: discordUser.email || null,
        avatar: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
        guilds: guildsData.map(g => ({
            id: g.id,
            name: g.name,
            icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null
        }))
    };

    req.session.user = sessionUser;
    log.success(`Logged in: ${discordUser.username}`);
    return sessionUser;
}

/* ─────────────────────────────────────────────────────────────────
   STEP 1 — Discord redirects here with ?code=&state=
   We verify state then pass code+state to the main app via URL.
   The main app handles the exchange (keeping UX seamless).
───────────────────────────────────────────────────────────────── */
app.get('/api/auth/discord-callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code || state !== req.session.oauthState) {
        log.warn('Invalid OAuth state or missing code');
        return res.status(400).send(`
            <!DOCTYPE html><html><head><title>Auth Error</title>
            <style>body{font-family:sans-serif;background:#23272a;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;}
            h2{color:#ed4245;}p{color:#b9bbbe;}</style></head>
            <body><h2>❌ Invalid login link</h2><p>State mismatch. Please try logging in again.</p>
            <script>setTimeout(()=>window.close(),3000)</script></body></html>
        `);
    }

    // Mark state as used so it can't be replayed
    req.session.pendingCode = code;
    req.session.oauthStateVerified = true;

    // Redirect to the main app — it will auto-exchange using /api/auth/exchange
    log.info(`State verified, redirecting to main app with code`);
    res.redirect(`/?discord_code=${encodeURIComponent(code)}&discord_state=${encodeURIComponent(state)}`);
});

/* ─────────────────────────────────────────────────────────────────
   STEP 2 — Main app calls this to exchange the code for a user.
   Client secret never leaves the server.
───────────────────────────────────────────────────────────────── */
app.get('/api/auth/exchange', async (req, res) => {
    const { code, state } = req.query;

    // Must match the verified state stored in session
    if (!code || !req.session.oauthStateVerified || state !== req.session.oauthState) {
        log.warn('/api/auth/exchange: state mismatch or missing code');
        // Fallback: if user is already in session (e.g. came from old flow), return them
        if (req.session.user) {
            log.info('Exchange fallback: returning existing session user');
            return res.json(req.session.user);
        }
        return res.status(401).json({ error: 'Invalid or expired auth link. Please log in again.' });
    }

    try {
        const user = await exchangeDiscordCode(code, req);

        // Clear one-time state to prevent replay attacks
        delete req.session.oauthStateVerified;
        delete req.session.oauthState;
        delete req.session.pendingCode;

        res.json(user);
    } catch (err) {
        log.error(`Exchange failed: ${err.message}`);

        // Last-resort fallback — check if session already has user from a previous exchange
        if (req.session.user) {
            log.info('Exchange error fallback: returning cached session user');
            return res.json(req.session.user);
        }

        res.status(500).json({ error: err.message || 'Exchange failed' });
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
        log.info('User logged out');
        res.clearCookie('connect.sid'); // Cleanly remove the cookie
        res.redirect('/');
    });
});

app.get('/api/auth/user', (req, res) => {
    log.info('Frontend requested current user session');
    if (!req.session.user) {
        return res.json(null);
    }
    res.json(req.session.user);
});

log.warn("Failed Loading /database/token/granter")
/* =======================
   🚀 START SERVER
======================= */
app.listen(PORT, () => {
    console.log(`\n${colors.fg.cyan}=====================================${colors.reset}`);
    log.success(`OAuth server running on http://localhost:${PORT}`);
    console.log(`${colors.fg.cyan}=====================================${colors.reset}\n`);

    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
        log.error('DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET not set in .env!');
    } else {
        log.info('Environment variables loaded correctly');
    }
});