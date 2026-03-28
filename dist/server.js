const express = require('express');
const fetch = require('node-fetch');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5001;

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static('.'));

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = `http://localhost:5001/api/auth/discord-callback`;

app.get('/api/auth/discord', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    req.session.oauthState = state;
    
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds',
        state: state
    });
    
    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

app.get('/api/auth/discord-callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code || state !== req.session.oauthState) {
        return res.status(400).send('Invalid state or missing code');
    }
    
    try {
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
            return res.status(401).send('Failed to get access token');
        }
        
        const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        
        const userData = await userResponse.json();
        
        const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        
        const guildsData = await guildsResponse.json();
        
        req.session.user = {
            id: userData.id,
            username: userData.username,
            avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
            guilds: guildsData.slice(0, 10)
        };
        
        res.redirect(`/?discord_token=${tokenData.access_token}&user=${encodeURIComponent(JSON.stringify(req.session.user))}`);
    } catch (error) {
        console.error('OAuth error:', error);
        res.status(500).send('Authentication failed');
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
});

app.get('/api/auth/user', (req, res) => {
    res.json(req.session.user || null);
});

app.listen(PORT, () => {
    console.log(`OAuth server running on port ${PORT}`);
    console.log('Make sure DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are set in environment');
});
