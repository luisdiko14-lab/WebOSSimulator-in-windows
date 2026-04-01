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
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Generates an exact 55-character cryptographically secure random string
const generate55CharState = () => {
    return crypto.randomBytes(40).toString('hex').substring(0, 55);
};

/* =======================
   🔗 ROUTES
======================= */
app.get('/api/auth/discord', (req, res) => {
    const state = generate55CharState();
    req.session.oauthState = state; // Save state to session to verify later

    log.info(`Starting Discord OAuth flow. State length: ${state.length}`);

    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds',
        state: state
    });

    res.redirect(`https://discord.com/api/v10/oauth2/authorize?${params.toString()}`);
});

app.get('/api/auth/discord-callback', async (req, res) => {
    const { code, state } = req.query;

    // Verify the state matches exactly what we generated
    if (!code || state !== req.session.oauthState) {
        log.warn('Invalid OAuth state or missing code (Potential CSRF attack)');
        return res.status(400).send('Invalid state or missing code');
    }

    try {
        log.info('Exchanging code for token...');

        // 1. Get the Access Token
        const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            log.error('Failed to get access token from Discord');
            return res.status(401).send('Failed to authenticate');
        }

        log.success('Access token received!');

        // 2. Fetch User Profile
        const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userResponse.json();

        // 3. Fetch User Guilds
        const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const guildsData = await guildsResponse.json();

        // 4. Save to Session (Cleanly)
        req.session.user = {
            id: userData.id,
            username: userData.username,
            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
            guilds: guildsData.slice(0, 10)
        };

        log.success(`User successfully logged in: ${userData.username}`);

        // Clean redirect to the home page (data is safely in the session now)
        res.redirect('/');

    } catch (error) {
        log.error(`OAuth error: ${error.message}`);
        res.status(500).send('Authentication failed');
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