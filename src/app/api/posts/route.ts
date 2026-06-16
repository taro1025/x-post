import { NextResponse } from 'next/server';
import { parseScheduleDate, parseSchedulePostInput, validateSchedulePostInput } from '@/lib/post-input';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { scheduledAt: 'asc' },
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error('API Error:', error);
        return jsonError('投稿一覧の取得に失敗しました。', 500);
    }
}

export async function POST(request: Request) {
    try {
        const input = parseSchedulePostInput(await request.json());
        const validationError = validateSchedulePostInput(input);
        if (validationError) return jsonError(validationError, 400);

        const post = await prisma.post.create({
            data: {
                content: input.content,
                scheduledAt: parseScheduleDate(input.scheduledAt)!,
                twitterAccountId: input.twitterAccountId,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('API Error:', error);
        return jsonError('予約投稿の作成に失敗しました。', 500);
    }
}
