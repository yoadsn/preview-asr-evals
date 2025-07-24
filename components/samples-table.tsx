'use client';

import { EvaluationSample } from '@/lib/models';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface SamplesTableProps {
    samples: EvaluationSample[];
    projectId: string;
    isEditable: boolean;
}

type SortField = 'name' | 'wer';
type SortDirection = 'asc' | 'desc';

export default function SamplesTable({ samples, projectId, isEditable }: SamplesTableProps) {
    const [sortField, setSortField] = useState<SortField>('wer');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const sortedSamples = useMemo(() => {
        return [...samples].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if (sortField === 'name') {
                aValue = a.name || a.id;
                bValue = b.name || b.id;
            } else {
                aValue = a.data?.alignment?.wer ?? Infinity;
                bValue = b.data?.alignment?.wer ?? Infinity;
            }

            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [samples, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'wer' ? 'desc' : 'asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="border-b">
                        <th 
                            className="text-left py-2 px-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Name</span>
                                <span className="text-xs">{getSortIcon('name')}</span>
                            </div>
                        </th>
                        <th 
                            className="text-left py-2 px-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('wer')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>WER %</span>
                                <span className="text-xs">{getSortIcon('wer')}</span>
                            </div>
                        </th>
                        <th className="text-right py-2 px-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedSamples.map((sample) => (
                        <tr key={sample.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 font-medium text-black">
                                {sample.name || sample.id}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-600">
                                {sample.data?.alignment?.wer !== undefined 
                                    ? `${(sample.data.alignment.wer * 100).toFixed(1)}%`
                                    : '-'
                                }
                            </td>
                            <td className="py-2 px-3 text-right">
                                <div className="flex justify-end space-x-2">
                                    {isEditable && (
                                        <Link 
                                            href={`/projects/${projectId}/samples/${sample.id}/edit`} 
                                            className="px-3 py-1 text-xs border border-transparent rounded text-white bg-yellow-600 hover:bg-yellow-700"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                    <Link 
                                        href={`/projects/${projectId}/samples/${sample.id}`} 
                                        className="px-3 py-1 text-xs border border-transparent rounded text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        View
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}