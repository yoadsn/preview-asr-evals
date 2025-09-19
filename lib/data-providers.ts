import { listFiles, downloadFile } from '@huggingface/hub';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Papa from 'papaparse';
import { Dataset } from './dataset-config';

// Data providers for ASR datasets
// This file defines how to interact with different data sources

export interface ASRDataProvider {
    name: string;
    description: string;
    initialize(dataset: Dataset): Promise<void>;
    listSamples(datasetSource: string): Promise<ASRSample[]>;
    getSampleAudioUrl(datasetSource: string, sampleId: string): Promise<string>;
    getSampleTranscriptionUrl(datasetSource: string, sampleId: string): Promise<string>;
    getSampleAudioFile(datasetSource: string, sampleId: string): Promise<{ downloadUrl?: string, streamUrl?: string, filename: string }>;
    getSampleTranscriptionFile(datasetSource: string, sampleId: string): Promise<{ downloadUrl?: string, streamUrl?: string, filename: string }>;
}

export interface ASRSample {
    id: string;
    name: string;
    metadata: {
        path: string;
        bucket?: string;
        fullPath?: string;
        quality_score?: number | null;
        avg_words_per_minute?: number | null;
        word_count?: number | null;
        duration?: number | null;
        [key: string]: any; // Allow additional properties
    };
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

    async initialize(dataset: Dataset): Promise<void> {
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

            let maxSamplesToLoad = 10;
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
                    maxSamplesToLoad--;
                    if (maxSamplesToLoad === 0) {
                        break;
                    }
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

    async getSampleAudioFile(datasetSource: string, sampleId: string): Promise<{ downloadUrl?: string, streamUrl?: string, filename: string }> {
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
                return { streamUrl: cachedFilePath, filename: bestAudioFile.filename };
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
            return { streamUrl: cachedFilePath, filename: bestAudioFile.filename };

        } catch (error) {
            console.error('Failed to get sample audio file:', error);
            throw error;
        }
    }

    async getSampleTranscriptionFile(datasetSource: string, sampleId: string): Promise<{ downloadUrl?: string, streamUrl?: string, filename: string }> {
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
                return { streamUrl: cachedFilePath, filename: 'transcript.aligned.json' };
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
            return { streamUrl: cachedFilePath, filename: 'transcript.aligned.json' };

        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                throw new Error(`Transcript file 'transcript.aligned.json' not found in sample folder ${sampleId}`);
            }
            console.error('Failed to get sample transcript file:', error);
            throw error;
        }
    }
}

// S3 Normalized Provider
class SRNormalizedProvider implements ASRDataProvider {
    name = "s3-normalized";
    description = "Normalized provider for S3-based ASR datasets";

    private s3Client?: S3Client;

    // Global cache for manifest data: bucket -> Record<sampleId, manifestData>
    private static manifestCache = new Map<string, Record<string, any>>();

    // Global cache for folder listings: datasetSource -> ASRSample[]
    private static folderListingCache = new Map<string, ASRSample[]>();

    async initialize(dataset: Dataset): Promise<void> {
        const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_S3_ACCESS_KEY_SECRET;

        if (!accessKeyId || !secretAccessKey) {
            throw new Error("AWS_S3_ACCESS_KEY_ID and AWS_S3_ACCESS_KEY_SECRET environment variables are required for s3-normalized provider");
        }

        this.s3Client = new S3Client({
            region: dataset.awsRegion,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    private parseS3Source(source: string): { bucket: string; prefix: string } {
        // Expected format: s3://bucket-name/path/to/dataset/
        if (!source.startsWith('s3://')) {
            throw new Error('S3 source must start with s3://');
        }

        const withoutS3 = source.substring(5); // Remove 's3://'
        const firstSlash = withoutS3.indexOf('/');

        if (firstSlash === -1) {
            throw new Error('S3 source must contain a bucket and path');
        }

        const bucket = withoutS3.substring(0, firstSlash);
        const prefix = withoutS3.substring(firstSlash + 1);

        return { bucket, prefix: prefix.endsWith('/') ? prefix : prefix + '/' };
    }

    private async loadManifestData(bucket: string, datasetPrefix: string): Promise<Record<string, any>> {
        // Use dataset-specific cache key
        const cacheKey = `${bucket}:${datasetPrefix}`;
        if (SRNormalizedProvider.manifestCache.has(cacheKey)) {
            console.info(`Using cached manifest data for dataset: ${cacheKey}`);
            return SRNormalizedProvider.manifestCache.get(cacheKey)!;
        }

        try {
            console.info(`Loading manifest data from dataset: ${cacheKey}`);

            // Load manifest.csv from dataset root (same level as sample directories)
            const manifestKey = `${datasetPrefix}manifest.csv`;
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: manifestKey,
            });

            if (!this.s3Client) {
                throw new Error('S3 client not initialized');
            }

            const response = await this.s3Client.send(command);
            const csvContent = await response.Body?.transformToString();

            if (!csvContent) {
                throw new Error(`Empty manifest file: ${manifestKey}`);
            }

            // Parse CSV using PapaParse
            const parsedData = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header: string) => header.trim(),
            });

            if (parsedData.errors && parsedData.errors.length > 0) {
                console.warn('CSV parsing errors:', parsedData.errors);
            }

            // Index data by source_entry_id for quick lookups
            const manifestMap: Record<string, any> = {};
            for (const row of parsedData.data as any[]) {
                if (row.source_entry_id) {
                    manifestMap[row.source_entry_id] = {
                        quality_score: parseFloat(row.quality_score) || null,
                        avg_words_per_minute: parseFloat(row.avg_words_per_minute) || null,
                        word_count: parseInt(row.word_count) || null,
                        duration: parseFloat(row.duration) || null,
                    };
                }
            }

            // Cache the manifest data
            SRNormalizedProvider.manifestCache.set(cacheKey, manifestMap);

            console.info(`Loaded and cached manifest data for ${Object.keys(manifestMap).length} samples from dataset: ${cacheKey}`);
            return manifestMap;
        } catch (error) {
            console.error(`Failed to load manifest data for dataset ${cacheKey}:`, error);
            // If manifest loading fails, cache an empty object to avoid repeated attempts
            SRNormalizedProvider.manifestCache.set(cacheKey, {});
            return {};
        }
    }

    async listSamples(datasetSource: string): Promise<ASRSample[]> {
        // Check cache first
        if (SRNormalizedProvider.folderListingCache.has(datasetSource)) {
            console.info(`Using cached folder listing for dataset: ${datasetSource}`);
            return SRNormalizedProvider.folderListingCache.get(datasetSource)!;
        }

        if (!this.s3Client) {
            throw new Error('Provider not initialized. Call initialize() first.');
        }

        const { bucket, prefix } = this.parseS3Source(datasetSource);

        try {
            // Load manifest data first (primary source for sample list)
            const manifestData = await this.loadManifestData(bucket, prefix);
            const samples: ASRSample[] = [];

            // Use manifest data as primary source (contains all samples beyond 1000 limit)
            for (const [sampleId, sampleManifestData] of Object.entries(manifestData)) {
                // Construct full path for the sample directory
                const samplePath = `${prefix}${sampleId}/`;

                // Create enriched metadata
                const enrichedMetadata = {
                    path: samplePath,
                    bucket,
                    fullPath: samplePath,
                    // Enriched data from manifest
                    quality_score: sampleManifestData.quality_score || null,
                    avg_words_per_minute: sampleManifestData.avg_words_per_minute || null,
                    word_count: sampleManifestData.word_count || null,
                    duration: sampleManifestData.duration || null,
                };

                samples.push({
                    id: sampleId,
                    name: sampleId,
                    metadata: enrichedMetadata
                });
            }

            console.info(`Found ${samples.length} samples from manifest data in dataset ${bucket}:${prefix}`);

            // If no samples found in manifest, fall back to S3 listing (legacy behavior)
            if (samples.length === 0) {
                console.warn('No samples found in manifest, falling back to S3 directory listing');

                const command = new ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: prefix,
                    Delimiter: '/', // List only top-level directories
                });

                const response = await this.s3Client.send(command);

                if (response.CommonPrefixes) {
                    for (const commonPrefix of response.CommonPrefixes) {
                        if (commonPrefix.Prefix) {
                            // Extract sample directory name from prefix relative to dataset prefix
                            const relativePath = commonPrefix.Prefix.substring(prefix.length);
                            if (relativePath && !relativePath.startsWith('/')) {
                                // This is a sample directory (not empty string)
                                const sampleId = relativePath.replace(/\/$/, ''); // Remove trailing slash

                                // Create basic metadata (no manifest data available)
                                const basicMetadata = {
                                    path: commonPrefix.Prefix,
                                    bucket,
                                    fullPath: commonPrefix.Prefix,
                                    quality_score: null,
                                    avg_words_per_minute: null,
                                    word_count: null,
                                    duration: null,
                                };

                                samples.push({
                                    id: sampleId,
                                    name: sampleId,
                                    metadata: basicMetadata
                                });
                            }
                        }
                    }
                }

                console.info(`Fallback: Found ${samples.length} sample directories in S3 bucket ${bucket}`);
            }

            // Cache the results
            SRNormalizedProvider.folderListingCache.set(datasetSource, samples);
            console.info(`Cached folder listing for dataset: ${datasetSource}`);
            return samples;
        } catch (error) {
            console.error('Failed to list samples from S3:', error);
            throw new Error(`Failed to fetch samples from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getSampleAudioUrl(datasetSource: string, sampleId: string): Promise<string> {
        if (!this.s3Client) {
            throw new Error('Provider not initialized. Call initialize() first.');
        }

        const { bucket, prefix } = this.parseS3Source(datasetSource);
        const audioKey = `${prefix}${sampleId}/audio.light.opus`;

        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: audioKey,
            });

            // Generate signed URL that expires in 1 hour
            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
            console.info(`Generated signed URL for audio file: ${audioKey}`);
            return signedUrl;
        } catch (error) {
            console.error('Failed to generate signed URL for audio file:', error);
            throw new Error(`Failed to generate signed URL for audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getSampleTranscriptionUrl(datasetSource: string, sampleId: string): Promise<string> {
        if (!this.s3Client) {
            throw new Error('Provider not initialized. Call initialize() first.');
        }

        const { bucket, prefix } = this.parseS3Source(datasetSource);
        const transcriptKey = `${prefix}${sampleId}/transcript.aligned.json`;

        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: transcriptKey,
            });

            // Generate signed URL that expires in 1 hour
            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
            console.info(`Generated signed URL for transcript file: ${transcriptKey}`);
            return signedUrl;
        } catch (error) {
            console.error('Failed to generate signed URL for transcript file:', error);
            throw new Error(`Failed to generate signed URL for transcript file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getSampleAudioFile(datasetSource: string, sampleId: string): Promise<{ downloadUrl?: string, streamUrl?: string, filename: string }> {
        // For S3 provider, we serve directly via signed URLs (both downloadUrl and streamUrl can be the same)
        const signedUrl = await this.getSampleAudioUrl(datasetSource, sampleId);

        return {
            downloadUrl: signedUrl, // Client can be redirected to this URL
            streamUrl: signedUrl,   // Content can be streamed to browser from this URL
            filename: "audio.light.opus"
        };
    }

    async getSampleTranscriptionFile(datasetSource: string, sampleId: string): Promise<{ downloadUrl?: string, streamUrl?: string, filename: string }> {
        // For S3 provider, we serve directly via signed URLs (both downloadUrl and streamUrl can be the same)
        const signedUrl = await this.getSampleTranscriptionUrl(datasetSource, sampleId);

        return {
            downloadUrl: signedUrl, // Client can be redirected to this URL
            streamUrl: signedUrl,   // Content can be streamed to browser from this URL
            filename: "transcript.aligned.json"
        };
    }
}

// Factory to create providers
class DataProviderFactory {
    private static providers = new Map<string, ASRDataset>();

    static async getProvider(dataset: Dataset): Promise<ASRDataProvider> {
        switch (dataset.type) {
            case 'hf-normalized':
                const provider = new HFNormalizedProvider();
                await provider.initialize(dataset);
                return provider;
            case 's3-normalized':
                const s3Provider = new SRNormalizedProvider();
                await s3Provider.initialize(dataset);
                return s3Provider;
            default:
                throw new Error(`Unknown provider type: ${dataset.type}`);
        }
    }
}

export { DataProviderFactory, HFNormalizedProvider, SRNormalizedProvider };
