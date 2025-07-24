'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EvaluationProject, EvaluationSample } from '@/lib/models';
import Link from 'next/link';

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  projectId: string | null;
  direction: SortDirection;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projectsWithSamples, setProjectsWithSamples] = useState<Array<{
    project: EvaluationProject;
    samples: EvaluationSample[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [sortState, setSortState] = useState<SortState>({ projectId: null, direction: null });
  
  const projectIds = searchParams.get('projects')?.split(',') || [];
  
  useEffect(() => {
    if (projectIds.length < 2) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const results = await Promise.all(
          projectIds.map(async (projectId) => {
            const [projectResponse, samplesResponse] = await Promise.all([
              fetch(`/api/projects/${projectId}`),
              fetch(`/api/projects/${projectId}/samples`)
            ]);
            
            if (!projectResponse.ok || !samplesResponse.ok) return null;
            
            const project = await projectResponse.json();
            const samples = await samplesResponse.json();
            return { project, samples };
          })
        );

        const validResults = results.filter(Boolean) as Array<{
          project: EvaluationProject;
          samples: EvaluationSample[];
        }>;

        if (validResults.length < 2) {
          router.push('/');
          return;
        }

        setProjectsWithSamples(validResults);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectIds, router]);

  // Find samples that match by name across projects
  const sampleNameMap = new Map<string, Map<string, EvaluationSample>>();
  
  projectsWithSamples.forEach(({ project, samples }) => {
    samples.forEach((sample) => {
      if (sample.name) {
        if (!sampleNameMap.has(sample.name)) {
          sampleNameMap.set(sample.name, new Map());
        }
        sampleNameMap.get(sample.name)!.set(project.id, sample);
      }
    });
  });

  // Filter to only include samples that exist in at least 2 projects
  let commonSamples = Array.from(sampleNameMap.entries()).filter(
    ([, projectSamples]) => projectSamples.size >= 2
  );

  // Sort samples if a sort is active
  if (sortState.projectId && sortState.direction) {
    commonSamples.sort(([, samplesA], [, samplesB]) => {
      const sampleA = samplesA.get(sortState.projectId!);
      const sampleB = samplesB.get(sortState.projectId!);
      
      // Handle missing samples (put them at the end)
      if (!sampleA && !sampleB) return 0;
      if (!sampleA) return 1;
      if (!sampleB) return -1;
      
      // Handle missing WER data (put them at the end)
      const werA = sampleA.data?.alignment.wer;
      const werB = sampleB.data?.alignment.wer;
      
      if (werA === undefined && werB === undefined) return 0;
      if (werA === undefined) return 1;
      if (werB === undefined) return -1;
      
      const diff = werA - werB;
      return sortState.direction === 'asc' ? diff : -diff;
    });
  }

  const handleSort = (projectId: string) => {
    setSortState(prevState => {
      if (prevState.projectId === projectId) {
        // Cycle through: asc -> desc -> none
        const nextDirection: SortDirection = 
          prevState.direction === null ? 'asc' :
          prevState.direction === 'asc' ? 'desc' : null;
        return { projectId: nextDirection ? projectId : null, direction: nextDirection };
      } else {
        // New column, start with asc
        return { projectId, direction: 'asc' };
      }
    });
  };

  const getSortIcon = (projectId: string) => {
    if (sortState.projectId !== projectId) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    if (sortState.direction === 'asc') {
      return <span className="text-blue-600 ml-1">↑</span>;
    }
    if (sortState.direction === 'desc') {
      return <span className="text-blue-600 ml-1">↓</span>;
    }
    return <span className="text-gray-300 ml-1">↕</span>;
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading comparison...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Projects
          </Link>
          <h1 className="text-2xl font-semibold text-black">Project Comparison</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-black">
            Comparing {projectsWithSamples.length} Projects
          </h2>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Select Other Projects To Compare
          </Link>
        </div>

        {commonSamples.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No samples with matching names found across the selected projects.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">
                    Sample Name
                  </th>
                  {projectsWithSamples.map(({ project }) => (
                    <th
                      key={project.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort(project.id)}
                      title="Click to sort by WER"
                    >
                      <div className="flex items-center">
                        {project.name}
                        {getSortIcon(project.id)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commonSamples.map(([sampleName, projectSamples]) => {
                  // Calculate best and worst WER for this row
                  const samplesWithWER = Array.from(projectSamples.values())
                    .filter(sample => sample.data?.alignment.wer !== undefined)
                    .map(sample => ({
                      sample,
                      wer: sample.data!.alignment.wer
                    }));
                  
                  const bestWER = samplesWithWER.length > 0 ? Math.min(...samplesWithWER.map(s => s.wer)) : null;
                  const worstWER = samplesWithWER.length > 0 ? Math.max(...samplesWithWER.map(s => s.wer)) : null;
                  
                  // Only highlight if there are multiple different WER values
                  const shouldHighlight = samplesWithWER.length > 1 && bestWER !== worstWER;

                  return (
                    <tr key={sampleName} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        {sampleName}
                      </td>
                      {projectsWithSamples.map(({ project }) => {
                        const sample = projectSamples.get(project.id);
                        const wer = sample?.data?.alignment.wer;
                        
                        // Determine background color
                        let bgColor = '';
                        if (shouldHighlight && wer !== undefined) {
                          if (wer === bestWER) {
                            bgColor = 'bg-green-100';
                          } else if (wer === worstWER) {
                            bgColor = 'bg-red-100';
                          }
                        }
                        
                        return (
                          <td
                            key={project.id}
                            className={`px-6 py-4 text-sm text-gray-500 border-r border-gray-200 last:border-r-0 ${bgColor}`}
                          >
                            {sample ? (
                              <div className="space-y-2">
                                <Link
                                  href={`/projects/${project.id}/samples/${sample.id}`}
                                  className="text-indigo-600 hover:text-indigo-500 underline"
                                >
                                  View Sample
                                </Link>
                                {sample.data && (
                                  <div className="text-xs text-gray-400">
                                    WER: {(sample.data.alignment.wer * 100).toFixed(1)}%
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Showing {commonSamples.length} samples that exist in multiple projects
        </div>
      </div>
    </main>
  );
}