import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const accounts = await prisma.twitterAccount.findMany({
            select: {
                id: true,
                twitterId: true,
                username: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json({ accounts });
    } catch (error: unknown) {
        console.error('Failed to fetch Twitter accounts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
