import Header from "@/components/header";

export default function Home() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            YI Whisper Training
                        </h1>
                        <p className="text-xl text-gray-600 mb-12">
                            Welcome to the YI Whisper training project system
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <a
                                href="/projects"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    View ASR Eval Projects
                                </h2>
                                <p className="text-gray-600">
                                    Browse and manage your ASR evaluation projects and results
                                </p>
                            </a>

                            <a
                                href="/transcribe"
                                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Transcribe Audio
                                </h2>
                                <p className="text-gray-600">
                                    Use YI Whisper models to transcribe your audio files
                                </p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
