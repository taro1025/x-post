import { TwitterApi } from 'twitter-api-v2';

export function getAppUrl() {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getCallbackUrl() {
    return `${getAppUrl()}/api/auth/twitter/callback`;
}

export function createOAuth2Client() {
    const clientId = process.env.X_CLIENT_ID;
    const clientSecret = process.env.X_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('X_CLIENT_ID and X_CLIENT_SECRET must be set');
    }

    return new TwitterApi({
        clientId,
        clientSecret,
    });
}
