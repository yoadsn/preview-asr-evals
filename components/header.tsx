'use server';
import { withAuth, signOut } from '@workos-inc/authkit-nextjs';
import Link from 'next/link';

export default async function Header() {
    const { user } = await withAuth({ ensureSignedIn: true });

    async function signOutAction() {
        'use server';
        await signOut();
    }

    return (
        <header className="bg-white shadow-sm">
            <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            href="/"
                            className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-600"
                        >
                            <span className="text-lg font-semibold">YI Whisper Training</span>
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            href="/projects"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                        >
                            View ASR Eval Projects
                        </Link>
                        <Link
                            href="/transcribe"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                        >
                            Transcribe Audio
                        </Link>
                    </div>
                    <div className="flex space-x-4 text-sm font-medium text-gray-700 text-center py-2">
                        <form
                            action={signOutAction}
                        >
                            <p>Welcome back {user?.firstName && `, ${user?.firstName}`}</p>
                            <button className="underline" type="submit">Sign out</button>
                        </form>
                    </div>
                </div>
            </nav>
        </header>
    );
}
