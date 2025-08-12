'use client';
import { useAuth } from '@workos-inc/authkit-nextjs/components';

export default function UserMenu() {
    const { user, signOut } = useAuth();

    return (
        <div className="flex space-x-4 text-sm font-medium text-gray-700 text-center pb-4">
            <form action={() => signOut()}>
                <p>Welcome back {user?.firstName && `, ${user?.firstName}`}, <button className="underline" type="submit">Sign out</button></p>
            </form>
        </div>
    );
}