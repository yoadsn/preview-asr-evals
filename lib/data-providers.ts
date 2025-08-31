import { listFiles, downloadFile } from '@huggingface/hub';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Data providers for ASR datasets
// This file defines how to interact with different data sources

export interface ASRDataProvider {
    name: string;
    description: string;
    initialize(): Promise<void>;
    listSamples(datasetSource: string): Promise<ASRSample[]>;
    getSampleAudioUrl(datasetSource: string, sampleId: string): Promise<string>;
    getSampleTranscriptionUrl(datasetSource: string, sampleId: string): Promise<string>;
    getSampleAudioFile(datasetSource: string, sampleId: string): Promise<{ cachedPath: string, filename: string }>;
    getSampleTranscriptionFile(datasetSource: string, sampleId: string): Promise<string>;
}

export interface ASRSample {
    id: string;
    name: string;
    metadata: Record<string, any>;
}

export interface ASRDataset {
    id: string;
    name: string;
    providerType: string;
    source: string;
}

// Hugging Face Normalized Provider
class HFNormalizedProvider implements ASRDataProvider {
    name = "hf-normalized";
    description = "Normalized provider for Hugging Face ASR datasets";

    private accessToken?: string;

    async initialize(): Promise<void> {
        this.accessToken = process.env.HF_ACCESS_TOKEN;
        if (!this.accessToken) {
            throw new Error("HF_ACCESS_TOKEN environment variable is required for hf-normalized provider");
        }
    }

    async listSamples(datasetSource: string): Promise<ASRSample[]> {
        // Validate and clean up dataset source
        if (!datasetSource || typeof datasetSource !== 'string') {
            throw new Error('Invalid dataset source: must be a non-empty string');
        }

        const datasetId = datasetSource.startsWith('datasets/') ? datasetSource : `datasets/${datasetSource}`;

        try {
            const samples: ASRSample[] = [];
            const fileIterator = listFiles({
                repo: datasetId,
                recursive: false,
                accessToken: this.accessToken
            });

            for await (const file of fileIterator) {
                // Filter for directories only - these represent sample directories
                if (file.type === 'directory') {
                    const sampleId = file.path;
                    samples.push({
                        id: sampleId,
                        name: file.path,
                        metadata: {
                            path: file.path,
                            type: file.type,
                            oid: file.oid,
                            size: file.size
                        }
                    });
                }
            }

            // If no directory samples found, log a warning
            if (samples.length === 0) {
                console.warn(`No directory samples found in dataset ${datasetId}. Please ensure the dataset contains sample directories.`);
            } else {
                console.info(`Found ${samples.length} directory samples in dataset ${datasetId}`);
            }

            return samples;
        } catch (error) {
            console.error('Failed to list samples from HF hub:', error);

            // Provide more specific error messages for common issues
            if (error instanceof Error) {
                if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    throw new Error('HF_ACCESS_TOKEN is invalid or expired. Please check your Hugging Face authentication token.');
                }
                if (error.message.includes('403') || error.message.includes('Forbidden')) {
                    throw new Error('Access denied to dataset. Please ensure you have read access to this dataset.');
                }
                if (error.message.includes('404') || error.message.includes('Not Found')) {
                    throw new Error(`Dataset '${datasetId}' not found on Hugging Face Hub. Please verify the dataset ID.`);
                }
                if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                    throw new Error('Rate limited by Hugging Face Hub. Please try again later.');
                }
            }

            throw new Error(`Failed to fetch samples from Hugging Face: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getSampleAudioUrl(datasetSource: string, sampleId: string): Promise<string> {
        throw new Error('getSampleAudioUrl is not implemented');
    }

    async getSampleTranscriptionUrl(datasetSource: string, sampleId: string): Promise<string> {
        throw new Error('getSampleTranscriptionUrl is not implemented');
    }

    private async getCacheDirectory(): Promise<string> {
        const cacheDir = path.join(process.cwd(), '.cache', 'hf-samples');
        await fs.mkdir(cacheDir, { recursive: true });
        return cacheDir;
    }

    private async getCachedFilePath(datasetId: string, sampleId: string, filePath: string): Promise<string> {
        const cacheDir = await this.getCacheDirectory();
        const hash = crypto.createHash('md5').update(`${datasetId}:${sampleId}:${filePath}`).digest('hex');
        return path.join(cacheDir, hash);
    }

    private getAudioFilePriority(filename: string): number {
        const lowercaseFile = filename.toLowerCase();
        if (lowercaseFile.includes('opus')) return 1;
        if (lowercaseFile.includes('mka')) return 2;
        if (lowercaseFile.includes('mp3')) return 3;
        return 4; // other audio files
    }

    async getSampleAudioFile(datasetSource: string, sampleId: string): Promise<{ cachedPath: string, filename: string }> {
        if (!sampleId || typeof sampleId !== 'string') {
            throw new Error('Invalid sampleId: must be a non-empty string');
        }

        const datasetId = datasetSource.startsWith('datasets/') ? datasetSource : `datasets/${datasetSource}`;

        try {
            // Use sampleId as the path to the sample folder within the dataset
            const sampleFolderPath = sampleId;

            // List files in the sample folder (non-recursive)
            const fileIterator = listFiles({
                repo: datasetId,
                path: sampleFolderPath,
                recursive: false,
                accessToken: this.accessToken
            });

            let bestAudioFile: { path: string; priority: number; filename: string } | null = null;
            let transcriptFile: string | null = null;

            for await (const file of fileIterator) {
                if (file.type === 'file') {
                    const filename = path.basename(file.path);
                    const filenameLower = filename.toLowerCase();

                    // Look for transcript.aligned.json
                    if (filenameLower === 'transcript.aligned.json') {
                        transcriptFile = file.path;
                    }

                    // Look for audio files (any file that starts with 'audio' or has common audio extensions)
                    if (filenameLower.startsWith('audio') || /\.(opus|mka|mp3|wav|flac|m4a|aac)$/i.test(filenameLower)) {
                        const priority = this.getAudioFilePriority(filenameLower);
                        if (!bestAudioFile || priority < bestAudioFile.priority) {
                            console.info(`Found audio file: ${filename} (priority: ${priority})`);
                            bestAudioFile = { path: file.path, priority, filename };
                        }
                    }
                }
            }

            if (!bestAudioFile) {
                throw new Error(`No audio file found in sample folder ${sampleId}`);
            }

            // Check cache first
            const cachedFilePath = await this.getCachedFilePath(datasetId, sampleId, bestAudioFile.path);
            try {
                await fs.access(cachedFilePath);
                console.info(`Serving cached audio file: ${cachedFilePath}`);
                return { cachedPath: cachedFilePath, filename: bestAudioFile.filename };
            } catch {
                // File not cached, download it
            }

            // Download the audio file
            console.info(`Downloading and caching audio file: ${bestAudioFile.path}`);
            const audioBlob = await downloadFile({
                repo: datasetId,
                path: bestAudioFile.path,
                accessToken: this.accessToken
            });

            if (!audioBlob) {
                throw new Error(`Audio file not found: ${bestAudioFile.path}`);
            }

            // Save blob to cache
            const arrayBuffer = await audioBlob.arrayBuffer();
            await fs.writeFile(cachedFilePath, new Uint8Array(arrayBuffer));

            console.info(`Audio file cached successfully: ${cachedFilePath}`);
            return { cachedPath: cachedFilePath, filename: bestAudioFile.filename };

        } catch (error) {
            console.error('Failed to get sample audio file:', error);
            throw error;
        }
    }

    async getSampleTranscriptionFile(datasetSource: string, sampleId: string): Promise<string> {
        if (!sampleId || typeof sampleId !== 'string') {
            throw new Error('Invalid sampleId: must be a non-empty string');
        }

        const datasetId = datasetSource.startsWith('datasets/') ? datasetSource : `datasets/${datasetSource}`;

        try {
            // Use sampleId as the path to the sample folder within the dataset
            const sampleFolderPath = sampleId;

            // Check cache for transcript.aligned.json
            const transcriptPath = path.join(sampleFolderPath, 'transcript.aligned.json');
            const cachedFilePath = await this.getCachedFilePath(datasetId, sampleId, transcriptPath);

            try {
                await fs.access(cachedFilePath);
                console.info(`Serving cached transcript file: ${cachedFilePath}`);
                return cachedFilePath;
            } catch {
                // File not cached, download it
            }

            // Download the transcript file
            console.info(`Downloading and caching transcript file: ${transcriptPath}`);
            const transcriptBlob = await downloadFile({
                repo: datasetId,
                path: transcriptPath,
                accessToken: this.accessToken
            });

            if (!transcriptBlob) {
                throw new Error(`Transcript file not found: ${transcriptPath}`);
            }

            // Save blob to cache
            const arrayBuffer = await transcriptBlob.arrayBuffer();
            await fs.writeFile(cachedFilePath, new Uint8Array(arrayBuffer));

            console.info(`Transcript file cached successfully: ${cachedFilePath}`);
            return cachedFilePath;

        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                throw new Error(`Transcript file 'transcript.aligned.json' not found in sample folder ${sampleId}`);
            }
            console.error('Failed to get sample transcript file:', error);
            throw error;
        }
    }
}

// Factory to create providers
class DataProviderFactory {
    private static providers = new Map<string, ASRDataset>();

    static async getProvider(providerType: string): Promise<ASRDataProvider> {
        switch (providerType) {
            case 'hf-normalized':
                const provider = new HFNormalizedProvider();
                await provider.initialize();
                return provider;
            default:
                throw new Error(`Unknown provider type: ${providerType}`);
        }
    }
}

export { DataProviderFactory, HFNormalizedProvider };
