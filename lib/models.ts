export interface EvaluationProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alignment {
  type: 'substitute' | 'equal' | 'insert' | 'delete';
  ref_start_idx: number;
  ref_end_idx: number;
  hyp_start_idx: number;
  hyp_end_idx: number;
}

export interface AlignmentResult {
  references: string[][];
  hypotheses: string[][];
  alignments: Alignment[][];
  wer: number;
  mer: number;
  wil: number;
  wip: number;
  hits: number;
  substitutions: number;
  insertions: number;
  deletions: number;
}

export interface AlignmentData {
  ref_text: string;
  hyp_text: string;
  alignment: AlignmentResult;
}

export interface EvaluationSample {
  id: string;
  projectId: string;
  name: string | null;
  audioUri: string | null;
  data: AlignmentData | null;
  createdAt: Date;
  updatedAt: Date;
}
