import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TwitterApi } from 'twitter-api-v2';

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

function createTwitterClient() {
    return new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_SECRET!,
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

async function publishPost(client: TwitterApi, post: PendingPost): Promise<PostResult> {
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

async function publishPendingPosts(client: TwitterApi, posts: PendingPost[]) {
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
        const results = await publishPendingPosts(createTwitterClient(), pendingPosts);
        return NextResponse.json({ processed: results.length, results });
    } catch (error: unknown) {
        console.error('Cron job failed:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
