import * as jose from 'jose'
import { authkit } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";

const client_id = process.env.WORKOS_CLIENT_ID;
const JWKS = jose.createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${client_id}`))

export default async function middleware(request: NextRequest) {
    const { session, headers, authorizationUrl } = await authkit(request, {
        debug: true,
    });


    if (request.url.includes('/api') && !session.user) {
        // Could be an API call from a script using access token to authenticate.
        const auth_header = request.headers.get("Authorization");
        if (auth_header) {
            // Verify the access token
            const token = auth_header.split(" ")[1];
            try {

                await jose.jwtVerify(token, JWKS, {
                    issuer: `https://api.workos.com/user_management/${client_id}`,
                });
            } catch (e) {
                // Invalid token
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
        } else {
            if (authorizationUrl)
                return NextResponse.redirect(authorizationUrl);
        }

    }

    // Headers from the authkit response need to be included in every non-redirect response to ensure that `withAuth` works as expected
    return NextResponse.next({
        headers: headers,
    });
}

// import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

// export default authkitMiddleware({
//     middlewareAuth: {
//         enabled: true,
//         unauthenticatedPaths: ['/api/projects'],
//     },
//     debug: true
// });

// Match against pages that require authentication
// Leave this out if you want authentication on every page in your application
export const config = { matcher: ['/:path*'] };
