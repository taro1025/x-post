import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TwitterApi as XApiClient } from 'twitter-api-v2';

export const dynamic = 'force-dynamic';

type PendingPost = Awaited<ReturnType<typeof getPendingPosts>>[number];
type PostResult =
    | { id: string; status: 'posted' }
    | { id: string; status: 'failed'; error: string };

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
}

function isUnauthorized(request: Request) {
    const authHeader = request.headers.get('authorization');
    return Boolean(process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`);
}

type XEnvName = 'X_API_KEY' | 'X_API_SECRET' | 'X_ACCESS_TOKEN' | 'X_ACCESS_SECRET';

function readXEnv(name: XEnvName) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is required`);
    return value;
}

function createXClient() {
    return new XApiClient({
        appKey: readXEnv('X_API_KEY'),
        appSecret: readXEnv('X_API_SECRET'),
        accessToken: readXEnv('X_ACCESS_TOKEN'),
        accessSecret: readXEnv('X_ACCESS_SECRET'),
    });
}

async function getPendingPosts(now: Date) {
    return prisma.post.findMany({
        where: {
            scheduledAt: { lte: now },
            postedAt: null,
            failedAt: null,
        },
    });
}

async function markPostAsFailed(postId: string, error: unknown): Promise<PostResult> {
    const message = getErrorMessage(error);
    await prisma.post.update({
        where: { id: postId },
        data: { failedAt: new Date(), error: message },
    });
    return { id: postId, status: 'failed', error: message };
}

async function publishPost(client: XApiClient, post: PendingPost): Promise<PostResult> {
    try {
        await client.v2.tweet(post.content);
        await prisma.post.update({
            where: { id: post.id },
            data: { postedAt: new Date() },
        });
        return { id: post.id, status: 'posted' };
    } catch (error: unknown) {
        console.error(`Failed to post ${post.id}:`, error);
        return markPostAsFailed(post.id, error);
    }
}

async function publishPendingPosts(client: XApiClient, posts: PendingPost[]) {
    const results: PostResult[] = [];
    for (const post of posts) {
        results.push(await publishPost(client, post));
    }
    return results;
}

export async function GET(request: Request) {
    try {
        if (isUnauthorized(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const pendingPosts = await getPendingPosts(new Date());
        if (pendingPosts.length === 0) {
            return NextResponse.json({ message: 'No pending posts' });
        }
        const results = await publishPendingPosts(createXClient(), pendingPosts);
        return NextResponse.json({ processed: results.length, results });
    } catch (error: unknown) {
        console.error('Cron job failed:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
