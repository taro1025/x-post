import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
    const basicAuthUser = process.env.BASIC_AUTH_USER;
    const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

    if (basicAuthUser && basicAuthPassword) {
        const basicAuth = req.headers.get('authorization');
        const url = req.nextUrl;

        // /api/cron は外部のバッチから叩かれるためBasic認証から除外
        if (url.pathname.startsWith('/api/cron')) {
            return NextResponse.next();
        }

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            try {
                const [user, pwd] = atob(authValue).split(':');
                if (user === basicAuthUser && pwd === basicAuthPassword) {
                    return NextResponse.next();
                }
            } catch (error) {
                // Ignore base64 decoding errors
            }
        }

        return new NextResponse('Auth required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
