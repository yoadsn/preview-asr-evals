import Link from 'next/link';
import UserMenu from './userMenu';

export default function Header() {
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
                        <Link
                            href="/dataset-preview"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                        >
                            Dataset Preview
                        </Link>
                    </div>
                </div>
                <UserMenu />
            </nav>
        </header>
    );
}
