// Lightweight Discord OAuth handler for the simulator
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 3001;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname === '/api/auth/discord') {
        const state = Math.random().toString(36).substring(7);
        const redirectUri = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/auth/discord-callback`;
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify+guilds&state=${state}`;
        
        res.writeHead(302, { 'Location': authUrl });
        res.end();
    } else if (pathname === '/api/auth/discord-callback') {
        const code = query.code;
        const state = query.state;

        if (!code || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
            return res.writeHead(400).end('Missing code or credentials');
        }

        try {
            const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: querystring.stringify({
                    client_id: DISCORD_CLIENT_ID,
                    client_secret: DISCORD_CLIENT_SECRET,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/auth/discord-callback`
                })
            });

            const tokenData = await tokenRes.json();
            if (!tokenData.access_token) throw new Error('No access token');

            const userRes = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            const userData = await userRes.json();

            const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            const guildsData = await guildsRes.json();

            const redirect = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/?user=${encodeURIComponent(JSON.stringify({
                id: userData.id,
                username: userData.username,
                avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
                guilds: guildsData.slice(0, 10)
            }))}&discord_token=${tokenData.access_token}`;

            res.writeHead(302, { 'Location': redirect });
            res.end();
        } catch (error) {
            console.error('OAuth error:', error);
            res.writeHead(400).end('Authentication failed');
        }
    } else if (pathname === '/api/auth/logout') {
        res.writeHead(302, { 'Location': '/' });
        res.end();
    } else {
        res.writeHead(404).end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Discord OAuth handler running on port ${PORT}`);
});
