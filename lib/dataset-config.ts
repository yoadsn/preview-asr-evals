// Central configuration for ASR datasets
// This file contains all dataset configurations and will be moved to a database later

export interface Dataset {
    id: string;
    name: string;
    type: string;
    source: string;
    awsRegion?: string;
}

// Hardcoded datasets for now - will be moved to database later
export const HARDCODED_DATASETS: Dataset[] = [
    // {
    //     id: "ivrit_ai_recital",
    //     name: "Ivrit.ai Recital",
    //     type: "hf-normalized",
    //     source: "ivrit-ai/crowd-recital"
    // },
    {
        id: "yi_whatsapp_prompts",
        name: "YI Whatsapp Prompts",
        type: "s3-normalized",
        source: "s3://serve-datasets/yi-whatsapp-prompts/",
        awsRegion: "eu-north-1"
    }
];

export function getDatasets(): Dataset[] {
    return HARDCODED_DATASETS;
}

export function getDatasetById(id: string): Dataset | undefined {
    return HARDCODED_DATASETS.find(dataset => dataset.id === id);
}
