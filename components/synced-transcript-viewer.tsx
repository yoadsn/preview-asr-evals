'use client';

import React, { useEffect, useRef, useCallback, memo } from 'react';
import {
    buildTimeline,
    findActiveAtTimestamp,
    TranscriptSegment,
    TimelineEntry,
    TransientWordInfo,
    TranscriptWord,
} from '@/lib/transcript-utils';

const getConfidenceColor = (confidenceProb: number): string => {
    // Interpolate between green (good) and red (bad)
    const red = Math.round(255 * (1 - confidenceProb));
    const green = Math.round(255 * confidenceProb);

    // Use translucent background so probability color doesn't overpower text
    return `rgba(${red}, ${green}, 0, 0.2)`;
};

interface SyncedTranscriptViewerProps {
    transcript: { segments: TranscriptSegment[] };
    audioRef: React.RefObject<HTMLAudioElement>;
    onWordClick?: (wordInfo: TransientWordInfo) => void;
    className?: string;
}

function SyncedTranscriptViewerImpl({
    transcript,
    audioRef,
    onWordClick,
    className = '',
}: SyncedTranscriptViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Prebuilt, immutable timeline (for binary search)
    const timelineRef = useRef<TimelineEntry[]>([]);
    // Fast reverse lookups
    const segmentIndexMapRef = useRef<Map<TranscriptSegment, number>>(new Map());

    // Cached DOM references for O(1) updates per frame
    const segmentElsRef = useRef<HTMLDivElement[]>([]);
    const wordElsRef = useRef<HTMLSpanElement[][]>([]);
    const gapElsRef = useRef<HTMLSpanElement[]>([]);
    const wordIndexMapsRef = useRef<Map<TranscriptWord, number>[]>([]);

    // Track last active DOM state to only patch diffs
    const lastActiveSegmentIndexRef = useRef<number | null>(null);
    const lastActiveWordIndexRef = useRef<number | null>(null);

    const rafIdRef = useRef<number | null>(null);

    // Build timeline and reverse maps when transcript changes
    useEffect(() => {
        timelineRef.current = buildTimeline(transcript);

        const segMap = new Map<TranscriptSegment, number>();
        transcript.segments.forEach((seg, i) => segMap.set(seg, i));
        segmentIndexMapRef.current = segMap;
    }, [transcript]);

    // After initial render (and when transcript changes), cache DOM elements
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Collect segment containers in DOM order
        const segNodes = Array.from(
            container.querySelectorAll<HTMLDivElement>('.transcript-segment')
        );
        segmentElsRef.current = segNodes;

        // For each segment, cache its word spans, and create a movable gap element
        const allWordRows: HTMLSpanElement[][] = [];
        const gapEls: HTMLSpanElement[] = [];

        segNodes.forEach((segEl) => {
            const wordSpans = Array.from(
                segEl.querySelectorAll<HTMLSpanElement>('span.transcript-word')
            );
            allWordRows.push(wordSpans);

            // Create one reusable gap element per segment
            const gapEl = document.createElement('span');
            gapEl.className = 'transcript-gap';
            gapEl.style.display = 'none';
            segEl.appendChild(gapEl);
            gapEls.push(gapEl);
        });

        wordElsRef.current = allWordRows;
        gapElsRef.current = gapEls;

        // Reset last active pointers on re-cache
        lastActiveSegmentIndexRef.current = null;
        lastActiveWordIndexRef.current = null;

        // Build per-segment O(1) word index lookup maps
        const indexMaps: Map<TranscriptWord, number>[] = [];
        transcript.segments.forEach((seg) => {
            const m = new Map<TranscriptWord, number>();
            seg.words.forEach((w, i) => m.set(w, i));
            indexMaps.push(m);
        });
        wordIndexMapsRef.current = indexMaps;
    }, [transcript]);

    // Efficient DOM patching for highlighting and gap indicator
    const applyHighlighting = useCallback(
        (currentTime: number) => {
            const timeline = timelineRef.current;
            if (timeline.length === 0) return;

            const { activeSegment, activeWord, gapBetweenWords } = findActiveAtTimestamp(
                timeline,
                currentTime
            );

            const segIndex =
                activeSegment != null ? segmentIndexMapRef.current.get(activeSegment) ?? null : null;

            // Toggle segment .active class
            const prevSegIdx = lastActiveSegmentIndexRef.current;
            if (prevSegIdx !== segIndex) {
                if (prevSegIdx != null && segmentElsRef.current[prevSegIdx]) {
                    segmentElsRef.current[prevSegIdx].classList.remove('active');
                    // Also hide previous gap if visible
                    const prevGap = gapElsRef.current[prevSegIdx];
                    if (prevGap) prevGap.style.display = 'none';
                }
                if (segIndex != null && segmentElsRef.current[segIndex]) {
                    segmentElsRef.current[segIndex].classList.add('active');

                    // Ensure active segment is centered in the scrollable container
                    const container = containerRef.current;
                    const segEl = segmentElsRef.current[segIndex];
                    if (container && segEl) {
                        const containerRect = container.getBoundingClientRect();
                        const segRect = segEl.getBoundingClientRect();
                        const offsetWithin = segRect.top - containerRect.top;
                        const desiredOffset = (container.clientHeight / 2) - (segEl.clientHeight / 2);
                        // Only scroll if we're far enough from center to avoid jitter
                        if (Math.abs(offsetWithin - desiredOffset) > 20) {
                            const targetScrollTop = container.scrollTop + (offsetWithin - desiredOffset);
                            container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
                        }
                    }
                }
                lastActiveSegmentIndexRef.current = segIndex;
            }

            // Toggle word border highlight
            const prevWordIdx = lastActiveWordIndexRef.current;
            let nextWordIdx: number | null = null;

            if (segIndex != null && activeWord) {
                const wordIdx = wordIndexMapsRef.current[segIndex]?.get(activeWord) ?? null;
                nextWordIdx = wordIdx;
            }

            if (prevWordIdx !== nextWordIdx || segIndex !== prevSegIdx) {
                // Clear previous border
                if (prevSegIdx != null && prevWordIdx != null) {
                    const prevWordEl = wordElsRef.current[prevSegIdx]?.[prevWordIdx];
                    if (prevWordEl) prevWordEl.style.borderBottomColor = 'transparent';
                }
                // Apply new border
                if (segIndex != null && nextWordIdx != null) {
                    const nextWordEl = wordElsRef.current[segIndex]?.[nextWordIdx];
                    if (nextWordEl) nextWordEl.style.borderBottomColor = '#000';
                }
                lastActiveWordIndexRef.current = nextWordIdx;
            }

            // Gap indicator: place the per-segment gap element after the correct word
            if (segIndex != null) {
                const gapEl = gapElsRef.current[segIndex];
                if (!gapEl) return;

                if (gapBetweenWords && !activeWord) {
                    const words = transcript.segments[segIndex].words;
                    let gapPos: number | null = null;

                    for (let i = 0; i < words.length - 1; i++) {
                        const curr = words[i];
                        const next = words[i + 1];
                        if (currentTime >= curr.end && currentTime <= next.start) {
                            gapPos = i;
                            break;
                        }
                    }

                    // If no specific gap found but still within segment, default to end
                    if (gapPos == null && words.length > 0) {
                        const last = words[words.length - 1];
                        if (currentTime >= last.end && currentTime <= activeSegment!.end) {
                            gapPos = words.length - 1;
                        }
                    }

                    if (gapPos != null) {
                        const hostWordEl = wordElsRef.current[segIndex]?.[gapPos];
                        if (hostWordEl && gapEl.parentElement === segmentElsRef.current[segIndex]) {
                            hostWordEl.insertAdjacentElement('afterend', gapEl);
                            gapEl.style.display = 'inline-block';
                        }
                    } else {
                        gapEl.style.display = 'none';
                    }
                } else {
                    // No gap when a word is active
                    gapEl.style.display = 'none';
                }
            }
        },
        [transcript.segments]
    );

    // requestAnimationFrame loop reading audio currentTime (bypasses React state)
    useEffect(() => {
        const loop = () => {
            const t = audioRef.current?.currentTime ?? 0;
            applyHighlighting(t);
            rafIdRef.current = requestAnimationFrame(loop);
        };

        rafIdRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafIdRef.current != null) {
                cancelAnimationFrame(rafIdRef.current);
            }
            rafIdRef.current = null;
        };
    }, [applyHighlighting, audioRef]);

    const handleWordClick = useCallback(
        (segmentIndex: number, wordIndex: number) => {
            const segment = transcript.segments[segmentIndex];
            if (!segment || !segment.words[wordIndex]) return;

            const wordInfo: TransientWordInfo = {
                word: segment.words[wordIndex],
                segmentIndex,
                wordIndex,
                segment,
            };

            onWordClick?.(wordInfo);
        },
        [transcript.segments, onWordClick]
    );

    const handleContextMenu = useCallback(
        (event: React.MouseEvent, segmentIndex: number, wordIndex: number) => {
            event.preventDefault();
            handleWordClick(segmentIndex, wordIndex);
        },
        [handleWordClick]
    );

    return (
        <div
            ref={containerRef}
            className={`transcript-viewer select-text ${className}`}
            style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
                lineHeight: '1.6',
                fontSize: '16px',
                color: '#374151',
            }}
        >
            <style jsx>{`
        .transcript-viewer {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .transcript-segment {
          margin-bottom: 1rem;
          transition: background-color 0.2s ease;
          padding: 0.25rem;
        }

        .transcript-segment.active {
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 0.375rem;
        }

        .transcript-word {
          display: inline-block;
          margin-right: 0.125rem;
          margin-bottom: 0.125rem;
          cursor: pointer;
          border-radius: 0.25rem;
          transition: background-color 0.15s ease, color 0.15s ease;
          padding: 0.125rem;
          border-bottom: 2px solid transparent;
          box-sizing: border-box; /* ensure 2px border doesn't change layout */
        }

        .transcript-word:hover {
          background-color: rgba(75, 85, 99, 0.1);
        }

        /* Active word uses bottom border only; avoid font-weight to prevent layout shift */
        .transcript-word.active {
        }

        .transcript-gap {
          display: inline-block;
          margin-left: 0.25rem;
          width: 2px;
          height: 1.2em;
          background-color: rgba(59, 130, 246, 1);
          border-radius: 1px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .transcript-text {
          margin: 0;
          white-space: pre-wrap;
        }
      `}</style>

            {transcript.segments.map((segment, segmentIndex) => (
                <div key={segmentIndex} className="transcript-segment" dir="rtl">
                    <div className="transcript-text">
                        {segment.words.map((word, wordIndex) => (
                            <span
                                key={`${segmentIndex}-${wordIndex}`}
                                className="transcript-word"
                                data-seg={segmentIndex}
                                data-word={wordIndex}
                                onClick={() => handleWordClick(segmentIndex, wordIndex)}
                                onContextMenu={(e) => handleContextMenu(e, segmentIndex, wordIndex)}
                                style={{
                                    color: '#000000',
                                    backgroundColor: getConfidenceColor(word.probability),
                                    fontStyle: word.probability < 0.5 ? 'italic' : 'normal',
                                }}
                                title={`Confidence: ${(word.probability * 100).toFixed(1)}% | Time: ${word.start.toFixed(
                                    2
                                )}s - ${word.end.toFixed(2)}s`}
                            >
                                {word.word}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Memoize to avoid re-rendering on parent updates (props are stable after load)
export default memo(SyncedTranscriptViewerImpl);
