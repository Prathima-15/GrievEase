# Audio Transcription - Quick Start Guide

## What's New? 🎤

The petition creation form now supports **Tamil speech-to-text transcription** with two convenient options:
1. **Upload pre-recorded audio files**
2. **Record live audio directly in the browser**

## How to Use

### Step-by-Step Instructions

#### Creating a Petition with Voice Input:

1. **Navigate to Petition Creation**
   - Go to "Create Petition" page
   - Fill in Steps 1 and 2 (basic details and location)
   - Proceed to Step 3 (Description)

2. **Access Voice Input**
   - You'll see a "Record Audio" button with a microphone icon
   - Click this button to open the audio recording modal

3. **Choose Your Method**
   
   **Option A: Upload Audio File**
   - Click "Upload Audio File" card
   - Select an audio file from your device
     - Supported: MP3, WAV, WebM, OGG, M4A
     - Maximum size: 50MB
   - Preview your audio before submission
   - Click "Submit for Transcription"

   **Option B: Live Recording**
   - Click "Live Recording" card
   - Grant microphone permission when prompted
   - Recording starts automatically
   - Speak your petition in Tamil
   - Click the stop button when finished
   - Review your recording with the audio player
   - Choose to re-record or submit for transcription
   - Click "Submit for Transcription"

4. **View Results**
   - Wait for processing (shows "Transcribing..." spinner)
   - Tamil transcript and English translation automatically appear in the description field
   - Edit the text if needed
   - Continue with your petition

## Visual Flow Diagram

```
┌─────────────────────────────────────┐
│   Step 3: Petition Description      │
│   ┌─────────────────────────────┐  │
│   │  Record Audio Button 🎤     │  │
│   └─────────────────────────────┘  │
│              ↓                      │
│   ┌─────────────────────────────┐  │
│   │      Modal Opens            │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓
    ┌─────────────────┐
    │  Choose Method  │
    └─────────────────┘
           ↓     ↓
    ┌──────┘     └──────┐
    │                   │
┌───▼────────┐    ┌────▼───────┐
│   Upload   │    │   Record   │
│   Audio    │    │    Live    │
└────┬───────┘    └────┬───────┘
     │                 │
     ├─ Select file   ├─ Grant mic permission
     ├─ Preview       ├─ Start recording
     ├─ Submit        ├─ Speak in Tamil
     │                ├─ Stop recording
     │                ├─ Preview
     │                └─ Submit
     │                 │
     └─────────┬───────┘
               ↓
    ┌──────────────────┐
    │   API Call to    │
    │   /transcribe    │
    └────────┬─────────┘
             ↓
    ┌────────────────────┐
    │  Gladia API        │
    │  Processing...     │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │  Response:         │
    │  - Tamil Text      │
    │  - English Text    │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │  Add to Description│
    │  Field             │
    └────────────────────┘
```

## Technical Details

### API Endpoint
- **URL:** `http://localhost:8000/transcribe`
- **Method:** POST
- **Auth:** Bearer Token (automatic)
- **Body:** FormData with `audio_file`

### Response Format
```json
{
  "success": true,
  "tamil_transcript": "தமிழ் உரை...",
  "english_translation": "English text...",
  "metadata": {
    "audio_duration": 15.5,
    "transcription_time": 3.2
  }
}
```

### Text Format in Description
```
Tamil: [Your Tamil speech transcript]

English Translation: [English translation]
```

## Browser Requirements

### For Live Recording:
- ✅ Chrome 49+ 
- ✅ Firefox 25+
- ✅ Edge (Chromium) 79+
- ✅ Safari 14+
- ✅ Opera 36+

### For File Upload:
- ✅ All modern browsers

## Permissions

### Microphone Access (Live Recording Only)
When you click "Live Recording" for the first time, your browser will ask:
```
[Your Site] wants to use your microphone
[Block] [Allow]
```
Click **Allow** to enable recording.

### Troubleshooting Microphone
If recording doesn't work:
1. Check browser permissions in settings
2. Ensure no other app is using the microphone
3. Try reloading the page
4. Check system microphone is not muted

## Features Highlight

### 🎯 Smart Integration
- Seamlessly integrated into petition creation flow
- No page refresh needed
- Works with existing form validation

### 🌍 Language Support
- Primary: Tamil speech recognition
- Automatic English translation included
- Both transcripts added to description

### 📱 Responsive Design
- Works on desktop and mobile browsers
- Touch-friendly interface
- Adapts to screen size

### ⚡ Real-time Feedback
- Live recording timer
- Processing spinner
- Success/error notifications
- Audio preview before submission

### 🔒 Secure & Private
- Authenticated API calls
- No permanent audio storage
- Automatic cleanup of recordings
- Microphone released after recording

## Example Use Cases

### Use Case 1: Field Report
- Officer visits location
- Records detailed report in Tamil using mobile
- Submits immediately with other petition details

### Use Case 2: Citizen Complaint
- Citizen has a grievance
- Records explanation in Tamil
- Gets automatic English translation for officials

### Use Case 3: Documentation
- Upload recorded interview audio
- Get transcript for records
- Both languages available for reference

## Tips for Best Results

### Recording Quality:
- 🎤 Speak clearly and at moderate pace
- 🔇 Record in a quiet environment
- 📏 Keep microphone at consistent distance
- ⏱️ Pause briefly between sentences
- 🔊 Speak at normal volume (not too loud or soft)

### File Upload:
- ✅ Use high-quality audio files
- ✅ Clear speech without background noise
- ✅ Supported formats work best: WAV, M4A, MP3
- ✅ Keep file size under 50MB

### After Transcription:
- ✏️ Review the transcript for accuracy
- ✏️ Edit any mistakes manually
- ✏️ Add additional context if needed
- ✏️ Both Tamil and English are editable

## Common Questions

**Q: Can I record in English?**
A: The system is optimized for Tamil. English recording may work but results may vary.

**Q: How long can I record?**
A: There's no hard limit, but keep recordings under 5 minutes for best results.

**Q: Can I delete the recording?**
A: Yes, you can close the modal to discard, or use "Re-record" button.

**Q: What if transcription fails?**
A: You'll see an error message. Try again or manually type your description.

**Q: Is my audio stored?**
A: No, audio is processed and immediately discarded. Not stored permanently.

**Q: Can I use both upload and recording?**
A: Yes! You can make multiple transcriptions. Each is appended to the description.

## Need Help?

If you encounter any issues:
1. Check that backend server is running on port 8000
2. Verify you're logged in (authentication required)
3. Check browser console for errors
4. Ensure stable internet connection
5. Try a different browser if problems persist

## Component Files

- **AudioRecorderModal.tsx** - Main modal component
- **SpeechToText.tsx** - Wrapper component with button
- **PetitionCreatePage.tsx** - Integration in Step 3

## Backend Configuration

The feature requires:
- ✅ FastAPI backend running
- ✅ Gladia API key configured
- ✅ `/transcribe` endpoint active
- ✅ CORS enabled for frontend URL

---

**Enjoy seamless voice input for your petitions!** 🎉
