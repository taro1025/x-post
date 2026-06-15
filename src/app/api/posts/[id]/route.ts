import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
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
        return NextResponse.json(
            { error: 'Failed to delete post', details: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
