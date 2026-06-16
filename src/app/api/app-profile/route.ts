import { NextResponse } from 'next/server';
import {
    APP_PROFILE_ID,
    emptyAppProfile,
    parseAppProfileInput,
    toAppProfileResponse,
    validateAppProfile,
} from '@/lib/app-profile';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

export async function GET() {
    try {
        const profile = await prisma.appProfile.findUnique({ where: { id: APP_PROFILE_ID } });
        return NextResponse.json(profile ? toAppProfileResponse(profile) : emptyAppProfile);
    } catch (error) {
        console.error('App profile GET error:', error);
        return jsonError('アプリ情報の取得に失敗しました。', 500);
    }
}

export async function PUT(request: Request) {
    try {
        const input = parseAppProfileInput(await request.json());
        const validationError = validateAppProfile(input);
        if (validationError) return jsonError(validationError, 400);

        const profile = await prisma.appProfile.upsert({
            where: { id: APP_PROFILE_ID },
            update: input,
            create: { id: APP_PROFILE_ID, ...input },
        });
        return NextResponse.json(toAppProfileResponse(profile));
    } catch (error) {
        console.error('App profile PUT error:', error);
        return jsonError('アプリ情報の保存に失敗しました。', 500);
    }
}
