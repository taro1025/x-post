import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createOAuth2Client, getCallbackUrl } from '@/lib/twitter';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = createOAuth2Client();
        const { url, codeVerifier, state } = client.generateOAuth2AuthLink(getCallbackUrl(), {
            scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        });

        const cookieStore = await cookies();
        
        cookieStore.set('twitter_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 15, // 15 minutes
            path: '/',
        });

        cookieStore.set('twitter_oauth_code_verifier', codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 15,
            path: '/',
        });

        return NextResponse.redirect(url);
    } catch (error: unknown) {
        console.error('Error generating Twitter OAuth link:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
