import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
}

function jsonError(message: string, status: number, details?: string) {
    return NextResponse.json({ error: message, details }, { status });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.post.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete API Error:', error);
        return jsonError('予約投稿の削除に失敗しました。', 500, getErrorMessage(error));
    }
}
