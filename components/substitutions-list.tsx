'use client';

import { Alignment, AlignmentResult } from '@/lib/models';
import React, { useState } from 'react';

interface SubsSample {
  refContextSpan: [number, number];
  hypContextSpan: [number, number];
  ref: string[];
  hyp: string[];
}

const contextExpansionSize = 3;

function mergeSpans(span1: [number, number], span2: [number, number]): [number, number] {
  return [Math.min(span1[0], span2[0]), Math.max(span1[1], span2[1])];
}

function mergeSubSamples(subSamples: SubsSample[]): SubsSample {
  let mergedSample = subSamples[0];

  for (let i = 1; i < subSamples.length; i++) {
    const sample = subSamples[i];
    mergedSample = {
      refContextSpan: mergeSpans(mergedSample.refContextSpan, sample.refContextSpan),
      hypContextSpan: mergeSpans(mergedSample.hypContextSpan, sample.hypContextSpan),
      ref: [...mergedSample.ref, ...sample.ref],
      hyp: [...mergedSample.hyp, ...sample.hyp],
    };
  }

  return mergedSample;
}

function getAlignedChunkWords(
  alignmentResult: AlignmentResult,
  chunk: Alignment
): {
  refWords: string[];
  hypWords: string[];
  refContextSpan: [number, number];
  hypContextSpan: [number, number];
} {
  const references = alignmentResult.references[0];
  const hypotheses = alignmentResult.hypotheses[0];

  let refWords: string[] = [];
  let hypWords: string[] = [];

  const refContextSpan: [number, number] = [
    Math.max(0, chunk.ref_start_idx - contextExpansionSize),
    Math.min(chunk.ref_end_idx + contextExpansionSize, references.length),
  ];

  const hypContextSpan: [number, number] = [
    Math.max(0, chunk.hyp_start_idx - contextExpansionSize),
    Math.min(chunk.hyp_end_idx + contextExpansionSize, hypotheses.length),
  ];

  if (chunk.type === 'equal') {
    refWords = references.slice(chunk.ref_start_idx, chunk.ref_end_idx);
    hypWords = hypotheses.slice(chunk.hyp_start_idx, chunk.hyp_end_idx);
  } else if (chunk.type === 'delete') {
    refWords = references.slice(chunk.ref_start_idx, chunk.ref_end_idx);
    hypWords = new Array(refWords.length).fill('');
  } else if (chunk.type === 'insert') {
    hypWords = hypotheses.slice(chunk.hyp_start_idx, chunk.hyp_end_idx);
    refWords = new Array(hypWords.length).fill('');
  } else if (chunk.type === 'substitute') {
    refWords = references.slice(chunk.ref_start_idx, chunk.ref_end_idx);
    hypWords = hypotheses.slice(chunk.hyp_start_idx, chunk.hyp_end_idx);
  }

  return { refWords, hypWords, refContextSpan, hypContextSpan };
}

function extractSubstitutionSamples(alignmentResult: AlignmentResult): SubsSample[] {
  const subsSamples: SubsSample[] = [];
  let prevChunk: Alignment | null = null;
  const allChunks = alignmentResult.alignments[0];

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const nextChunk = i < allChunks.length - 1 ? allChunks[i + 1] : null;
    let sampleToStore: SubsSample | null = null;

    if (chunk.type === 'delete' || chunk.type === 'insert') {
      if (prevChunk && prevChunk.type === 'substitute') {
        const prevResult = getAlignedChunkWords(alignmentResult, prevChunk);
        const prevSample: SubsSample = {
          refContextSpan: prevResult.refContextSpan,
          hypContextSpan: prevResult.hypContextSpan,
          ref: prevResult.refWords,
          hyp: prevResult.hypWords,
        };

        const currentResult = getAlignedChunkWords(alignmentResult, chunk);
        const currentSample: SubsSample = {
          refContextSpan: currentResult.refContextSpan,
          hypContextSpan: currentResult.hypContextSpan,
          ref: currentResult.refWords,
          hyp: currentResult.hypWords,
        };

        sampleToStore = mergeSubSamples([prevSample, currentSample]);
      }
    }

    if (chunk.type === 'substitute') {
      if (nextChunk && (nextChunk.type === 'insert' || nextChunk.type === 'delete')) {
        // Allow the next chunk to capture this chunk
      } else {
        let prevSample: SubsSample | null = null;
        if (prevChunk && (prevChunk.type === 'insert' || prevChunk.type === 'delete')) {
          const prevResult = getAlignedChunkWords(alignmentResult, prevChunk);
          prevSample = {
            refContextSpan: prevResult.refContextSpan,
            hypContextSpan: prevResult.hypContextSpan,
            ref: prevResult.refWords,
            hyp: prevResult.hypWords,
          };
        }

        const currentResult = getAlignedChunkWords(alignmentResult, chunk);
        const currentSample: SubsSample = {
          refContextSpan: currentResult.refContextSpan,
          hypContextSpan: currentResult.hypContextSpan,
          ref: currentResult.refWords,
          hyp: currentResult.hypWords,
        };

        sampleToStore = prevSample ? mergeSubSamples([prevSample, currentSample]) : currentSample;
      }
    }

    if (sampleToStore) {
      subsSamples.push(sampleToStore);
      prevChunk = null; // consume once
    } else {
      prevChunk = chunk;
    }
  }

  return subsSamples;
}

interface SubstitutionsListProps {
  alignment: AlignmentResult;
}

const SubstitutionsList: React.FC<SubstitutionsListProps> = ({ alignment }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const substitutionSamples = extractSubstitutionSamples(alignment);
  const references = alignment.references[0];
  const hypotheses = alignment.hypotheses[0];

  const renderSubstitutionSample = (sample: SubsSample, index: number) => {
    // Get context words
    const refContext = references.slice(sample.refContextSpan[0], sample.refContextSpan[1]);
    const hypContext = hypotheses.slice(sample.hypContextSpan[0], sample.hypContextSpan[1]);

    return (
      <React.Fragment key={index}>
        <tr className='text-green-600'>
          <td className="align-top text-end">
            {refContext.join(' ')}
          </td>
          <td className="border-gray-300 align-top text-center">
            <span className="px-2 py-1 rounded text-sm">
              {sample.ref.filter(w => w !== '').join(' ')}
            </span>
          </td>
          <td>
          </td>
        </tr>
        <tr className='border-b border-gray-300 text-red-600'>
          <td>
          </td>
          <td className="border-gray-300 align-top text-center">
            <span className="px-2 py-1 rounded text-sm">
              {sample.hyp.filter(w => w !== '').join(' ')}
            </span>
          </td>
          <td className="border-gray-300 align-top text-start pb-3">
            {hypContext.join(' ')}
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm mb-8">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2 className="text-xl font-medium text-black">Substitutions List</h2>
        <div className="text-gray-500">
          {isCollapsed ? '▼' : '▲'}
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-4">
          {substitutionSamples.length > 0 ? (
            <div>
              <div className="text-sm text-gray-600 mb-4">
                Found {substitutionSamples.length} substitution error{substitutionSamples.length !== 1 ? 's' : ''}:
              </div>
              <div className="border rounded-md p-4 bg-gray-50 mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse" dir="rtl">
                    <thead>
                      <tr>
                        <th className="text-center font-medium pb-2 border-b border-gray-300">Ref Context</th>
                        <th className="text-center font-medium pb-2 border-b border-gray-300">Ref/Hyp</th>
                        <th className="text-center font-medium pb-2 border-b border-gray-300">Hyp Context</th>
                      </tr>
                    </thead>
                    <tbody>
                      {substitutionSamples.map(renderSubstitutionSample)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md border text-gray-500">
              No substitution errors found
            </div>
          )}
        </div>
      )
      }
    </div >
  );
};

export default SubstitutionsList;