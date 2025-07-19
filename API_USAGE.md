# API Usage Guide

This document provides examples of how to interact with the ASR Evaluation API using REST clients.

## Base URL

Replace `{BASE_URL}` in the examples below with your actual API base URL (e.g., `https://your-app.vercel.app` or `http://localhost:3000` for local development).

## Complete Workflow Example

This guide demonstrates the complete workflow for creating a project, adding a sample, uploading audio, and uploading sample data.

### 1. Create a New Project

Create a new evaluation project and get its ID.

**Endpoint:** `POST /api/projects`

**Request Body:**
```json
{
  "name": "My ASR Evaluation Project",
  "description": "Optional project description"
}
```

**Response:**
```json
{
  "id": "project-uuid-here",
  "name": "My ASR Evaluation Project",
  "description": "Optional project description",
  "createdAt": "2025-01-19T07:50:00.000Z",
  "updatedAt": "2025-01-19T07:50:00.000Z"
}
```

#### cURL Example:
```bash
curl -X POST "{BASE_URL}/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My ASR Evaluation Project",
    "description": "Testing speech recognition accuracy"
  }'
```

#### Python Example:
```python
import requests
import json

# Create a new project
def create_project(base_url, name, description=None):
    url = f"{base_url}/api/projects"
    payload = {"name": name}
    if description:
        payload["description"] = description
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Usage
base_url = "https://your-app.vercel.app"  # Replace with your actual URL
project = create_project(base_url, "My ASR Evaluation Project", "Testing speech recognition accuracy")
project_id = project["id"]
print(f"Created project with ID: {project_id}")
```

### 2. Create a New Sample

Create a new sample within the project and get its ID.

**Endpoint:** `POST /api/samples`

**Request Body:**
```json
{
  "projectId": "project-uuid-here"
}
```

**Response:**
```json
{
  "id": "sample-uuid-here",
  "projectId": "project-uuid-here",
  "audioUri": null,
  "data": null,
  "createdAt": "2025-01-19T07:51:00.000Z",
  "updatedAt": "2025-01-19T07:51:00.000Z"
}
```

#### cURL Example:
```bash
curl -X POST "{BASE_URL}/api/samples" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid-here"
  }'
```

#### Python Example:
```python
def create_sample(base_url, project_id):
    url = f"{base_url}/api/samples"
    payload = {"projectId": project_id}
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Usage
sample = create_sample(base_url, project_id)
sample_id = sample["id"]
print(f"Created sample with ID: {sample_id}")
```

### 3. Upload Audio File

Upload an audio file directly to the sample.

**Endpoint:** `POST /api/samples/{sampleId}/upload-direct-audio`

**Request:** Multipart form data with a file field named `file`

**Supported Audio Formats:**
- `audio/mpeg` (MP3)
- `audio/wav` (WAV)

**Response:**
```json
{
  "url": "https://blob-storage-url/audio-file.mp3"
}
```

#### cURL Example:
```bash
curl -X POST "{BASE_URL}/api/samples/sample-uuid-here/upload-direct-audio" \
  -F "file=@/path/to/your/audio.mp3"
```

#### Python Example:
```python
def upload_audio(base_url, sample_id, audio_file_path):
    url = f"{base_url}/api/samples/{sample_id}/upload-direct-audio"
    
    with open(audio_file_path, 'rb') as audio_file:
        files = {'file': audio_file}
        response = requests.post(url, files=files)
    
    response.raise_for_status()
    return response.json()

# Usage
audio_result = upload_audio(base_url, sample_id, "/path/to/your/audio.mp3")
audio_url = audio_result["url"]
print(f"Uploaded audio to: {audio_url}")
```

### 4. Upload Sample Data

Upload the evaluation data (reference text, hypothesis text, and alignment results) for the sample.

**Endpoint:** `POST /api/samples/{sampleId}/data`

**Request Body:**
```json
{
  "data": {
    "ref_text": "The reference transcription text",
    "hyp_text": "The hypothesis transcription text",
    "alignment": {
      "references": [["The", "reference", "transcription", "text"]],
      "hypotheses": [["The", "hypothesis", "transcription", "text"]],
      "alignments": [[
        {
          "type": "equal",
          "ref_start_idx": 0,
          "ref_end_idx": 1,
          "hyp_start_idx": 0,
          "hyp_end_idx": 1
        },
        {
          "type": "substitute",
          "ref_start_idx": 1,
          "ref_end_idx": 2,
          "hyp_start_idx": 1,
          "hyp_end_idx": 2
        }
      ]],
      "wer": 0.25,
      "mer": 0.25,
      "wil": 0.25,
      "wip": 0.75,
      "hits": 3,
      "substitutions": 1,
      "insertions": 0,
      "deletions": 0
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

#### cURL Example:
```bash
curl -X POST "{BASE_URL}/api/samples/sample-uuid-here/data" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "ref_text": "The reference transcription text",
      "hyp_text": "The hypothesis transcription text",
      "alignment": {
        "references": [["The", "reference", "transcription", "text"]],
        "hypotheses": [["The", "hypothesis", "transcription", "text"]],
        "alignments": [[
          {
            "type": "equal",
            "ref_start_idx": 0,
            "ref_end_idx": 1,
            "hyp_start_idx": 0,
            "hyp_end_idx": 1
          },
          {
            "type": "substitute",
            "ref_start_idx": 1,
            "ref_end_idx": 2,
            "hyp_start_idx": 1,
            "hyp_end_idx": 2
          }
        ]],
        "wer": 0.25,
        "mer": 0.25,
        "wil": 0.25,
        "wip": 0.75,
        "hits": 3,
        "substitutions": 1,
        "insertions": 0,
        "deletions": 0
      }
    }
  }'
```

#### Python Example:
```python
def upload_sample_data(base_url, sample_id, ref_text, hyp_text, alignment_data):
    url = f"{base_url}/api/samples/{sample_id}/data"
    payload = {
        "data": {
            "ref_text": ref_text,
            "hyp_text": hyp_text,
            "alignment": alignment_data
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Example alignment data structure
alignment_data = {
    "references": [["The", "reference", "transcription", "text"]],
    "hypotheses": [["The", "hypothesis", "transcription", "text"]],
    "alignments": [[
        {
            "type": "equal",
            "ref_start_idx": 0,
            "ref_end_idx": 1,
            "hyp_start_idx": 0,
            "hyp_end_idx": 1
        },
        {
            "type": "substitute",
            "ref_start_idx": 1,
            "ref_end_idx": 2,
            "hyp_start_idx": 1,
            "hyp_end_idx": 2
        }
    ]],
    "wer": 0.25,
    "mer": 0.25,
    "wil": 0.25,
    "wip": 0.75,
    "hits": 3,
    "substitutions": 1,
    "insertions": 0,
    "deletions": 0
}

# Usage
data_result = upload_sample_data(
    base_url, 
    sample_id, 
    "The reference transcription text",
    "The hypothesis transcription text",
    alignment_data
)
print("Sample data uploaded successfully")
```

## Complete Python Script Example

Here's a complete Python script that demonstrates the entire workflow:

```python
import requests
import json

class ASREvaluationClient:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
    
    def create_project(self, name, description=None):
        """Create a new evaluation project."""
        url = f"{self.base_url}/api/projects"
        payload = {"name": name}
        if description:
            payload["description"] = description
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def create_sample(self, project_id):
        """Create a new sample in a project."""
        url = f"{self.base_url}/api/samples"
        payload = {"projectId": project_id}
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def upload_audio(self, sample_id, audio_file_path):
        """Upload an audio file to a sample."""
        url = f"{self.base_url}/api/samples/{sample_id}/upload-direct-audio"
        
        with open(audio_file_path, 'rb') as audio_file:
            files = {'file': audio_file}
            response = requests.post(url, files=files)
        
        response.raise_for_status()
        return response.json()
    
    def upload_sample_data(self, sample_id, ref_text, hyp_text, alignment_data):
        """Upload evaluation data to a sample."""
        url = f"{self.base_url}/api/samples/{sample_id}/data"
        payload = {
            "data": {
                "ref_text": ref_text,
                "hyp_text": hyp_text,
                "alignment": alignment_data
            }
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()

# Usage example
def main():
    # Initialize client
    client = ASREvaluationClient("https://your-app.vercel.app")
    
    # 1. Create project
    project = client.create_project(
        "My ASR Evaluation Project",
        "Testing speech recognition accuracy"
    )
    print(f"Created project: {project['id']}")
    
    # 2. Create sample
    sample = client.create_sample(project['id'])
    print(f"Created sample: {sample['id']}")
    
    # 3. Upload audio
    audio_result = client.upload_audio(sample['id'], "/path/to/audio.mp3")
    print(f"Uploaded audio: {audio_result['url']}")
    
    # 4. Upload sample data
    alignment_data = {
        "references": [["Hello", "world"]],
        "hypotheses": [["Hello", "word"]],
        "alignments": [[
            {"type": "equal", "ref_start_idx": 0, "ref_end_idx": 1, "hyp_start_idx": 0, "hyp_end_idx": 1},
            {"type": "substitute", "ref_start_idx": 1, "ref_end_idx": 2, "hyp_start_idx": 1, "hyp_end_idx": 2}
        ]],
        "wer": 0.5,
        "mer": 0.5,
        "wil": 0.5,
        "wip": 0.5,
        "hits": 1,
        "substitutions": 1,
        "insertions": 0,
        "deletions": 0
    }
    
    data_result = client.upload_sample_data(
        sample['id'],
        "Hello world",
        "Hello word",
        alignment_data
    )
    print("Sample data uploaded successfully")

if __name__ == "__main__":
    main()
```

## Data Structure Reference

### Alignment Types
- `equal`: Words match exactly
- `substitute`: Word was substituted
- `insert`: Word was inserted in hypothesis
- `delete`: Word was deleted from reference

### Alignment Metrics
- `wer`: Word Error Rate
- `mer`: Match Error Rate  
- `wil`: Word Information Lost
- `wip`: Word Information Preserved
- `hits`: Number of correct words
- `substitutions`: Number of substituted words
- `insertions`: Number of inserted words
- `deletions`: Number of deleted words

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (missing required fields, invalid data)
- `404`: Resource not found
- `500`: Internal server error

Error responses include a JSON object with an `error` field describing the issue:
```json
{
  "error": "Description of the error"
}
