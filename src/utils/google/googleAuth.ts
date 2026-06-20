import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URL || '';

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !REDIRECT_URI) {
    console.error('Missing Google OAuth environment variables for your account. Check .env.local');
    throw new Error('Google OAuth configuration incomplete.');
}

export const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
});

oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        console.log('NEW REFRESH TOKEN RECEIVED. PLEASE UPDATE YOUR GOOGLE_REFRESH_TOKEN ENV VAR:', tokens.refresh_token);
    }
    console.log('Google Access Token refreshed.');
});