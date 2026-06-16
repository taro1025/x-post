import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createOAuth2Client, getCallbackUrl, getAppUrl } from '@/lib/twitter';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');

    const cookieStore = await cookies();
    const storedState = cookieStore.get('twitter_oauth_state')?.value;
    const codeVerifier = cookieStore.get('twitter_oauth_code_verifier')?.value;

    if (!state || !code || !storedState || !codeVerifier) {
        return NextResponse.json({ error: 'Missing parameters or session expired' }, { status: 400 });
    }

    if (state !== storedState) {
        return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
    }

    try {
        const client = createOAuth2Client();
        const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: getCallbackUrl(),
        });

        // Get user info
        const me = await loggedClient.v2.me();
        const twitterId = me.data.id;
        const username = me.data.username;

        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        // Store or update account in DB
        await prisma.twitterAccount.upsert({
            where: { twitterId },
            update: {
                username,
                accessToken,
                refreshToken: refreshToken || null,
                expiresAt,
            },
            create: {
                twitterId,
                username,
                accessToken,
                refreshToken: refreshToken || null,
                expiresAt,
            },
        });

        // Clean up cookies
        cookieStore.delete('twitter_oauth_state');
        cookieStore.delete('twitter_oauth_code_verifier');

        return NextResponse.redirect(`${getAppUrl()}/?success=twitter_linked`);
    } catch (error: unknown) {
        console.error('Error during Twitter callback:', error);
        return NextResponse.redirect(`${getAppUrl()}/?error=twitter_link_failed`);
    }
}
