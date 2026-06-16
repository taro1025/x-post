import { NextResponse } from 'next/server';
import { APP_PROFILE_ID, toAppProfileResponse, validateAppProfile } from '@/lib/app-profile';
import { generateMarketingPosts, isOpenAIConfigured } from '@/lib/openai-posts';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

function readTheme(value: unknown) {
    if (!value || typeof value !== 'object') return '';
    const theme = (value as Record<string, unknown>).theme;
    return typeof theme === 'string' ? theme.trim().slice(0, 160) : '';
}

export async function POST(request: Request) {
    try {
        if (!isOpenAIConfigured()) return jsonError('OPENAI_API_KEY が設定されていません。', 400);

        const profile = await prisma.appProfile.findUnique({ where: { id: APP_PROFILE_ID } });
        if (!profile) return jsonError('先にアプリ情報を保存してください。', 400);

        const input = toAppProfileResponse(profile);
        const validationError = validateAppProfile(input);
        if (validationError) return jsonError(validationError, 400);

        const posts = await generateMarketingPosts(input, readTheme(await request.json()));
        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Generate posts error:', error);
        return jsonError('投稿案の生成に失敗しました。', 500);
    }
}
