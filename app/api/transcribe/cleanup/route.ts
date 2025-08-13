import { NextResponse } from 'next/server';
import { cleanupOrphanedTranscriptionFiles } from '@/lib/blob';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        console.log('Starting manual cleanup of orphaned transcription files...');
        
        const result = await cleanupOrphanedTranscriptionFiles();
        
        return NextResponse.json({
            success: true,
            message: `Cleanup completed. Deleted ${result.deletedCount} files.`,
            deletedCount: result.deletedCount,
            errors: result.errors.length > 0 ? result.errors : undefined
        }, { status: 200 });

    } catch (error) {
        console.error('Manual cleanup error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to perform cleanup',
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}