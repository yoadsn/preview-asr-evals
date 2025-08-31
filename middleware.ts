import * as jose from 'jose'
import { authkit } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";

const client_id = process.env.WORKOS_CLIENT_ID;
const JWKS = jose.createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${client_id}`))

export default async function middleware(request: NextRequest) {
    const { session, headers, authorizationUrl } = await authkit(request, {
        debug: true,
    });

    // Disable authentication if DEV_DISABLE_AUTH is set
    if (process.env.DEV_DISABLE_AUTH) {
        return NextResponse.next({
            headers: headers,
        });
    }

    if (!session.user && !request.url.includes('/auth')) {
        var authByHeaderOk = false;
        if (request.url.includes('/api')) {
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

                authByHeaderOk = true;
            }

            if (!authByHeaderOk) {
                // No access token in the header, API should not redirect
                return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
            }
        } else {
            if (authorizationUrl) {
                return NextResponse.redirect(authorizationUrl);
            }
        }

    }

    // Headers from the authkit response need to be included in every non-redirect response to ensure that `withAuth` works as expected
    return NextResponse.next({
        headers: headers,
    });
}
