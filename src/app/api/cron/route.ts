import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TwitterApi } from 'twitter-api-v2';

export async function GET(request: Request) {
    try {
        // Basic security check (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const pendingPosts = await prisma.post.findMany({
            where: {
                scheduledAt: { lte: now },
                postedAt: null,
                failedAt: null,
            },
        });

        if (pendingPosts.length === 0) {
            return NextResponse.json({ message: 'No pending posts' });
        }

        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY!,
            appSecret: process.env.TWITTER_API_SECRET!,
            accessToken: process.env.TWITTER_ACCESS_TOKEN!,
            accessSecret: process.env.TWITTER_ACCESS_SECRET!,
        });

        const results = [];

        for (const post of pendingPosts) {
            try {
                await client.v2.tweet(post.content);

                await prisma.post.update({
                    where: { id: post.id },
                    data: { postedAt: new Date() },
                });
                results.push({ id: post.id, status: 'posted' });
            } catch (error: any) {
                console.error(`Failed to post ${post.id}:`, error);
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        failedAt: new Date(),
                        error: error.message || 'Unknown error',
                    },
                });
                results.push({ id: post.id, status: 'failed', error: error.message });
            }
        }

        return NextResponse.json({ processed: results.length, results });
    } catch (error: any) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
