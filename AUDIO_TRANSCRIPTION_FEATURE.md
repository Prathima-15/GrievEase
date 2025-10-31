# Audio Transcription Feature Documentation

## Overview
The Speech-to-Text feature has been enhanced with a modal interface that allows users to either upload pre-recorded audio files or record live audio directly in the browser. The audio is then sent to the backend `/transcribe` endpoint for Tamil speech-to-text transcription with English translation.

## Components Created

### 1. AudioRecorderModal.tsx
A comprehensive modal component that handles both audio upload and live recording functionality.

**Features:**
- **Two Modes:**
  - **Upload Mode**: Upload pre-recorded audio files (MP3, WAV, WebM, OGG, M4A)
  - **Record Mode**: Live audio recording using browser's MediaRecorder API

- **Audio Upload:**
  - Drag-and-drop file upload
  - File type validation
  - Audio preview player
  - File size display

- **Live Recording:**
  - Real-time recording with timer
  - Visual recording indicator (pulsing red dot)
  - Stop/Re-record functionality
  - Audio playback before submission

- **Transcription:**
  - Sends audio file to `/transcribe` endpoint
  - Displays loading state during processing
  - Returns Tamil transcript and English translation
  - Error handling with user-friendly messages

### 2. Updated SpeechToText.tsx
Simplified component that now triggers the AudioRecorderModal.

**Changes:**
- Removed simulated speech recognition logic
- Added "Record Audio" button to open modal
- Handles transcript received from modal
- Combines Tamil and English transcripts in the textarea

## API Integration

### Endpoint: `/transcribe`
**URL:** `http://localhost:8000/transcribe`  
**Method:** POST  
**Authentication:** Bearer Token (required)

**Request:**
```typescript
FormData {
  audio_file: File  // Audio file (WebM, MP3, WAV, M4A, OGG)
}
```

**Response:**
```typescript
{
  tamil_transcript: string,      // Original Tamil speech transcript
  english_translation: string,   // English translation
  status: string,               // "success"
  processing_time: number       // Time taken in seconds
}
```

**Error Response:**
```typescript
{
  detail: string  // Error message
}
```

## User Flow

### Upload Audio File Flow:
1. User clicks "Record Audio" button in petition description field
2. Modal opens showing two options: "Upload Audio File" or "Live Recording"
3. User clicks "Upload Audio File"
4. User selects an audio file from their device
5. Audio preview is displayed
6. User clicks "Submit for Transcription"
7. File is sent to `/transcribe` endpoint
8. Loading state shows "Transcribing..."
9. Response received with Tamil and English transcripts
10. Transcripts are added to the long description textarea
11. Modal closes automatically

### Live Recording Flow:
1. User clicks "Record Audio" button in petition description field
2. Modal opens showing two options
3. User clicks "Live Recording"
4. Browser requests microphone permission
5. User grants permission
6. Recording starts automatically
7. Timer shows recording duration
8. User speaks their petition in Tamil
9. User clicks stop button
10. Recording stops and audio preview is shown
11. User can either re-record or submit for transcription
12. Upon submission, same API flow as upload mode
13. Transcripts are added to the description field

## Technical Implementation Details

### Live Recording
- Uses `navigator.mediaDevices.getUserMedia()` for microphone access
- `MediaRecorder` API for capturing audio
- Audio format: WebM (browser default)
- Automatic track cleanup to release microphone

### File Upload
- Accepts multiple audio formats
- Client-side file type validation
- URL.createObjectURL() for audio preview
- Proper cleanup with URL.revokeObjectURL()

### State Management
- Modal open/close state
- Recording state (idle/recording/stopped)
- Processing state during transcription
- Audio blob/file state
- Timer for recording duration

### Error Handling
- Microphone permission denied
- Invalid file types
- Network errors during transcription
- Backend API errors
- Toast notifications for user feedback

## Transcript Format
The transcripts are combined and formatted as:
```
Tamil: [Original Tamil speech transcript]

English Translation: [English translation of the speech]
```

If the textarea already has content, the new transcripts are appended with line breaks.

## Browser Compatibility
- **Audio Recording:** Chrome, Firefox, Edge (Chromium), Safari 14+
- **File Upload:** All modern browsers
- **Required APIs:**
  - MediaRecorder API
  - getUserMedia API
  - FormData API
  - Fetch API

## Permissions Required
- **Microphone Access:** Required only for live recording
- **Browser prompts user automatically**

## File Size Limits
- **Client-side:** Max 50MB (can be adjusted)
- **Backend:** Configured in backend server settings

## Security Considerations
- Bearer token authentication required
- Audio files not stored permanently (processed and discarded)
- Microphone access only when recording
- Automatic cleanup of media streams

## Future Enhancements
1. Support for multiple languages
2. Real-time transcription during recording
3. Audio format conversion on client-side
4. Transcript editing before adding to description
5. Support for longer audio files (chunked upload)
6. Offline audio storage for retry on network failure

## Testing the Feature

1. **Start the backend server:**
   ```bash
   cd backend/DataBase
   python enhanced_main.py
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Test Upload Mode:**
   - Navigate to petition creation page (Step 3)
   - Click "Record Audio" button
   - Select "Upload Audio File"
   - Choose a Tamil audio file
   - Click "Submit for Transcription"
   - Verify transcripts appear in description

4. **Test Recording Mode:**
   - Click "Record Audio" button
   - Select "Live Recording"
   - Allow microphone access
   - Speak in Tamil
   - Click stop button
   - Review the recording
   - Submit for transcription
   - Verify transcripts appear in description

## Troubleshooting

### Microphone Not Working
- Check browser permissions
- Ensure no other app is using the microphone
- Try in a different browser
- Check system microphone settings

### Transcription Fails
- Verify backend server is running on port 8000
- Check Gladia API key is valid
- Ensure audio file format is supported
- Check network connectivity
- Review backend logs for errors

### Modal Not Opening
- Check for JavaScript errors in console
- Verify all components are properly imported
- Ensure Dialog component is available

### Audio Not Playing
- Check browser audio settings
- Verify audio file is not corrupted
- Try a different audio format

## API Error Codes

| Status Code | Error | Solution |
|-------------|-------|----------|
| 401 | Unauthorized | Check user authentication token |
| 400 | Invalid file format | Upload supported audio format |
| 413 | File too large | Reduce audio file size |
| 500 | Server error | Check backend logs |
| 503 | Gladia API unavailable | Retry after some time |

## Performance Considerations

- Large audio files may take longer to upload
- Transcription time depends on audio length
- Live recording creates WebM format (efficient)
- Modal keeps audio in memory until closed
- Proper cleanup prevents memory leaks

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- Clear visual feedback for all states
- Error messages are descriptive
- Button states clearly indicated

## Component Props

### AudioRecorderModal Props
```typescript
interface AudioRecorderModalProps {
  isOpen: boolean;                    // Controls modal visibility
  onClose: () => void;                // Called when modal closes
  onTranscriptReceived: (            // Called with transcription results
    tamilTranscript: string,
    englishTranslation: string
  ) => void;
}
```

### SpeechToText Props
```typescript
interface SpeechToTextProps {
  onTranscriptChange: (transcript: string) => void;  // Called when text changes
  placeholder?: string;                               // Textarea placeholder
  value?: string;                                     // Initial/controlled value
}
```

## Integration Example

Already integrated in `PetitionCreatePage.tsx` at Step 3:

```tsx
<SpeechToText
  onTranscriptChange={setLongDescription}
  value={longDescription}
  placeholder="Describe your issue in detail..."
/>
```

This automatically includes the "Record Audio" button and modal functionality.
