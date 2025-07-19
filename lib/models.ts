export interface EvaluationProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationSample {
  id: string;
  projectId: string;
  audioUri: string | null;
  referenceTextUri: string | null;
  hypothesisTextUri: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}
