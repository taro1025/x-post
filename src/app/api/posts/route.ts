import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { scheduledAt: 'asc' },
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { content, scheduledAt } = await request.json();

        if (!content || !scheduledAt) {
            return NextResponse.json({ error: 'Content and scheduledAt are required' }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                content,
                scheduledAt: new Date(scheduledAt),
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
