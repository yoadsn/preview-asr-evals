// Utility functions for transcript processing and timeline synchronization

export interface TranscriptSegment {
    start: number;
    end: number;
    words: TranscriptWord[];
}

export interface TranscriptWord {
    word: string;
    start: number;
    end: number;
    probability: number;
}

export interface TimelineEntry {
    timestamp: number;
    type: 'segment_start' | 'segment_end' | 'word_start' | 'word_end';
    segment: TranscriptSegment;
    word?: TranscriptWord;
}

export interface WordPosition {
    start: number;
    end: number;
    segmentIndex: number;
    wordIndex: number;
}

/**
 * Build a timeline index from transcript segments for efficient timestamp lookups
 */
export function buildTimeline(transcript: { segments: TranscriptSegment[] }): TimelineEntry[] {
    const timeline: TimelineEntry[] = [];

    transcript.segments.forEach((segment, segmentIndex) => {
        // Segment start
        timeline.push({
            timestamp: segment.start,
            type: 'segment_start',
            segment
        });

        // Word events within segment
        segment.words.forEach((word, wordIndex) => {
            timeline.push({
                timestamp: word.start,
                type: 'word_start',
                segment,
                word
            });

            timeline.push({
                timestamp: word.end,
                type: 'word_end',
                segment,
                word
            });
        });

        // Segment end
        timeline.push({
            timestamp: segment.end,
            type: 'segment_end',
            segment
        });
    });

    // Sort by timestamp to enable binary search
    return timeline.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Find active segment and word for a given timestamp using binary search
 */
export function findActiveAtTimestamp(
    timeline: TimelineEntry[],
    currentTime: number
): { activeSegment?: TranscriptSegment; activeWord?: TranscriptWord; gapBetweenWords?: boolean } {
    if (!timeline.length) return {};

    // Find the last event that occurred before or at current time
    let left = 0;
    let right = timeline.length - 1;
    let lastValidIndex = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (timeline[mid].timestamp <= currentTime) {
            lastValidIndex = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (lastValidIndex === -1) return {};

    const lastEvent = timeline[lastValidIndex];

    // Find active segment (last segment that hasn't ended)
    let activeSegment: TranscriptSegment | undefined;
    for (let i = lastValidIndex; i >= 0; i--) {
        if (timeline[i].type === 'segment_start' &&
            (timeline.findIndex(e => e.type === 'segment_end' && e.timestamp > currentTime && e.segment === timeline[i].segment) !== -1 ||
                timeline.some(e => e.type === 'segment_end' && e.segment === timeline[i].segment && e.timestamp > currentTime))) {
            activeSegment = timeline[i].segment;
            break;
        }
    }

    // Find active word (word that hasn't ended yet)
    let activeWord: TranscriptWord | undefined;
    for (let i = lastValidIndex; i >= 0; i--) {
        if (timeline[i].type === 'word_start' &&
            (timeline.findIndex(e => e.type === 'word_end' && e.timestamp > currentTime && e.word === timeline[i].word) !== -1 ||
                timeline.some(e => e.type === 'word_end' && e.word === timeline[i].word && e.timestamp > currentTime))) {
            activeWord = timeline[i].word;
            break;
        }
    }

    // Check if there's a gap between words (no active word but time is between word end and next word start)
    let gapBetweenWords = false;
    if (!activeWord && activeSegment) {
        gapBetweenWords = timeline.slice(lastValidIndex + 1).some(entry =>
            entry.segment === activeSegment &&
            entry.type === 'word_start' &&
            entry.timestamp > currentTime
        );
    }

    return { activeSegment, activeWord, gapBetweenWords };
}

export interface TransientWordInfo {
    word: TranscriptWord;
    segmentIndex: number;
    wordIndex: number;
    segment: TranscriptSegment;
}
