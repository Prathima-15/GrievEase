# 🎙️ Audio Transcription API Documentation

## Overview

The `/transcribe` endpoint converts Tamil audio files to text and provides English translation using Gladia AI.

## Endpoint Details

### POST `/transcribe`

Transcribe Tamil audio and translate to English.

#### Authentication
- **Required**: Yes
- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <token>`

#### Request

**Content-Type**: `multipart/form-data`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `audio_file` | File | Yes | Audio file (WAV, MP3, M4A, etc.) |

**Supported Audio Formats**:
- WAV
- MP3
- M4A
- OGG
- FLAC
- And other common audio formats

#### Response

**Success Response** (200 OK):
```json
{
  "success": true,
  "tamil_transcript": "திரைத்திலவியா திருவிலாவை முன்னிட்டு வாலபாடி, ஜல்லிக்கட்டு விலா நென்று நடைபெற்ற வருகிறது...",
  "english_translation": "The Jallikattu event is being conducted in Valapady, in honor of the Thiruvilava festival...",
  "metadata": {
    "audio_duration": 16.8,
    "transcription_time": 12.965
  }
}
```

**Error Responses**:

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid file or missing parameters |
| 401 | Unauthorized - Invalid or missing token |
| 408 | Request Timeout - Transcription took too long |
| 500 | Internal Server Error - Transcription failed |

**Error Response Example**:
```json
{
  "detail": "Failed to upload audio file"
}
```

## Usage Examples

### cURL
```bash
curl -X POST "http://localhost:8000/transcribe" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "audio_file=@path/to/audio.wav"
```

### Python (requests)
```python
import requests

url = "http://localhost:8000/transcribe"
headers = {"Authorization": "Bearer YOUR_TOKEN"}
files = {"audio_file": open("audio.wav", "rb")}

response = requests.post(url, headers=headers, files=files, timeout=300)
result = response.json()

print("Tamil:", result["tamil_transcript"])
print("English:", result["english_translation"])
```

### JavaScript (Fetch API)
```javascript
const formData = new FormData();
formData.append('audio_file', audioFile);

const response = await fetch('http://localhost:8000/transcribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Tamil:', result.tamil_transcript);
console.log('English:', result.english_translation);
```

### TypeScript (React)
```typescript
const transcribeAudio = async (audioFile: File, token: string) => {
  const formData = new FormData();
  formData.append('audio_file', audioFile);

  const response = await fetch('http://localhost:8000/transcribe', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Transcription failed');
  }

  return await response.json();
};
```

## Processing Flow

1. **Upload Audio** → Audio file is uploaded to Gladia API
2. **Request Transcription** → Transcription job is created with Tamil language config
3. **Poll for Results** → Server polls Gladia API every 2 seconds until complete
4. **Extract Data** → Tamil transcript and English translation are extracted
5. **Return Response** → JSON response with both transcripts

```
Client → FastAPI → Gladia Upload → Gladia Transcribe → Poll Results → Response
```

## Configuration

The transcription uses the following Gladia configuration:

```python
config = {
    "language_config": {
        "languages": ["ta"],  # Tamil
        "code_switching": True,  # Handle mixed languages
    },
    "diarization": False,  # No speaker identification
    "translation": True,  # Enable translation
    "translation_config": {
        "target_languages": ["en"],  # Translate to English
        "model": "base"
    },
    "punctuation_enhanced": True  # Better punctuation
}
```

## Performance

- **Typical Processing Time**: 10-20 seconds for 1 minute of audio
- **Maximum Wait Time**: 2 minutes (120 seconds)
- **Timeout**: 5 minutes (300 seconds)
- **Polling Interval**: 2 seconds

## Limitations

- **File Size**: Recommended max 100MB
- **Audio Duration**: Works best with audio under 10 minutes
- **Language**: Optimized for Tamil audio
- **Concurrent Requests**: Limited by Gladia API quota

## Error Handling

### Common Errors

1. **File Upload Failed**
   - Cause: Audio file couldn't be uploaded to Gladia
   - Solution: Check file format and size

2. **Transcription Timeout**
   - Cause: Processing took longer than 2 minutes
   - Solution: Try with shorter audio or retry

3. **Authentication Failed**
   - Cause: Invalid or expired token
   - Solution: Login again to get a new token

4. **Invalid Audio Format**
   - Cause: Unsupported audio format
   - Solution: Convert to WAV, MP3, or M4A

## Integration with Petition Form

### Use Case: Voice-to-Text for Petition Description

```typescript
// In your petition creation form
const handleVoiceInput = async (audioBlob: Blob) => {
  try {
    const audioFile = new File([audioBlob], "voice_input.wav", {
      type: "audio/wav"
    });

    const result = await transcribeAudio(audioFile, user.token);

    // Use Tamil transcript for petition description
    setPetitionDescription(result.tamil_transcript);

    toast({
      title: "Voice recorded successfully",
      description: "Your voice has been converted to text"
    });
  } catch (error) {
    toast({
      title: "Transcription failed",
      description: "Please try again or type manually",
      variant: "destructive"
    });
  }
};
```

## Security

- ✅ **Authentication Required**: All requests must include valid Bearer token
- ✅ **User Validation**: Token is validated against database
- ✅ **API Key Protection**: Gladia API key is stored server-side only
- ✅ **File Validation**: File type and size are validated
- ✅ **Timeout Protection**: Requests timeout after 5 minutes

## Best Practices

1. **Show Loading State**: Transcription can take 10-30 seconds
2. **Handle Errors Gracefully**: Provide fallback to manual text input
3. **Validate Audio Quality**: Better audio = better transcription
4. **Limit File Size**: Keep audio files under 50MB for faster processing
5. **Use Appropriate Format**: WAV and M4A work best for Tamil audio

## Testing

Run the test script:
```bash
cd backend/DataBase
python test_transcribe_api.py
```

Make sure:
- Backend server is running
- You have valid credentials
- Audio file (MALad.wav) is in the directory

## Monitoring

Check server logs for:
- Upload success/failure
- Transcription processing time
- Error messages
- API quota usage

## Future Enhancements

- [ ] Support multiple languages (Hindi, Kannada, Telugu)
- [ ] Real-time streaming transcription
- [ ] Speaker diarization (identify multiple speakers)
- [ ] Confidence scores for transcription quality
- [ ] Audio quality analysis before transcription
- [ ] Caching for duplicate audio files

---

**API Version**: 2.0.0  
**Last Updated**: October 22, 2025  
**Gladia API**: v2
