'use client';

import { AlignmentResult } from '@/lib/models';
import React from 'react';

interface ProcessedWord {
    type: 'cor' | 'sub' | 'ins' | 'del';
    ref?: string;
    hyp?: string;
}

const AlignmentVisualization: React.FC<{ alignment: AlignmentResult }> = ({
    alignment,
}) => {
    const processAlignment = (
        alignmentResult: AlignmentResult,
    ): ProcessedWord[] => {
        const words: ProcessedWord[] = [];
        if (
            !alignmentResult.alignments ||
            !alignmentResult.alignments[0] ||
            !alignmentResult.references ||
            !alignmentResult.references[0] ||
            !alignmentResult.hypotheses ||
            !alignmentResult.hypotheses[0]
        ) {
            return words;
        }

        const alignments = alignmentResult.alignments[0];
        const references = alignmentResult.references[0];
        const hypotheses = alignmentResult.hypotheses[0];

        for (const align of alignments) {
            const refWords = references.slice(align.ref_start_idx, align.ref_end_idx);
            const hypWords = hypotheses.slice(align.hyp_start_idx, align.hyp_end_idx);
            const len = Math.max(refWords.length, hypWords.length);

            for (let i = 0; i < len; i++) {
                const refWord = refWords[i];
                const hypWord = hypWords[i];

                switch (align.type) {
                    case 'equal':
                        words.push({ type: 'cor', ref: refWord, hyp: hypWord });
                        break;
                    case 'substitute':
                        words.push({ type: 'sub', ref: refWord, hyp: hypWord });
                        break;
                    case 'insert':
                        words.push({ type: 'ins', hyp: hypWord });
                        break;
                    case 'delete':
                        words.push({ type: 'del', ref: refWord });
                        break;
                }
            }
        }

        return words;
    };

    const processedWords = processAlignment(alignment);

    const renderAlignmentOperation = (word: ProcessedWord, index: number) => {
        let refContent: React.ReactNode = <span>&nbsp;</span>;
        let hypContent: React.ReactNode = <span>&nbsp;</span>;
        let refClassName = 'bg-transparent px-1';
        let hypClassName = 'bg-transparent px-1';

        switch (word.type) {
            case 'sub':
                refClassName = 'bg-yellow-100 px-1';
                hypClassName = 'bg-yellow-100 px-1';
                refContent = word.ref;
                hypContent = word.hyp;
                break;
            case 'ins':
                hypClassName = 'bg-green-100 px-1';
                hypContent = word.hyp;
                break;
            case 'del':
                refClassName = 'bg-red-100 px-1';
                refContent = word.ref;
                break;
            case 'cor':
            default:
                refClassName = 'bg-gray-100 px-1';
                hypClassName = 'bg-white px-1';
                refContent = word.ref;
                hypContent = word.hyp;
                break;
        }

        return (
            <div key={index} className="flex flex-col text-center mx-1">
                <div className="py-1"><span className={refClassName}>{refContent}</span></div>
                <div className="py-1"><span className={hypClassName}>{hypContent}</span></div>
            </div>
        );
    };

    return (
        <div className="flex flex-row overflow-x-auto bg-gray-50 p-2 rounded-md border">
            {processedWords.map(renderAlignmentOperation)}
        </div>
    );
};

export default AlignmentVisualization;
