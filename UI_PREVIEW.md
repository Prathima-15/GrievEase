# Audio Transcription UI Preview

## Modal States Visual Guide

### 1. Initial State - Mode Selection
```
┌─────────────────────────────────────────────────┐
│  Speech to Text                            [X]  │
│  Choose to upload an audio file or record live  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐   ┌──────────────────┐   │
│  │   📤 Upload      │   │   🎤 Record      │   │
│  │                  │   │                  │   │
│  │  Upload Audio    │   │  Live Recording  │   │
│  │      File        │   │                  │   │
│  │                  │   │                  │   │
│  │  MP3, WAV,       │   │ Record in        │   │
│  │  M4A, etc.       │   │  real-time       │   │
│  └──────────────────┘   └──────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. Upload Mode - File Selection
```
┌─────────────────────────────────────────────────┐
│  Speech to Text                    [← Back] [X] │
│  Upload Audio File                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │              📤 Upload Icon               │ │
│  │                                           │ │
│  │     Click to upload or drag and drop      │ │
│  │                                           │ │
│  │      MP3, WAV, WebM, OGG, M4A            │ │
│  │            (max. 50MB)                    │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [No file selected]                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3. Upload Mode - File Selected with Preview
```
┌─────────────────────────────────────────────────┐
│  Speech to Text                    [← Back] [X] │
│  Upload Audio File                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  📁 tamil_petition_audio.mp3     2.5 MB  │ │
│  │                                           │ │
│  │  [▶] ─────●──────────────── 00:45/02:15  │ │
│  │      (Audio Player Controls)              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │     Submit for Transcription  🎯          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. Upload Mode - Processing
```
┌─────────────────────────────────────────────────┐
│  Speech to Text                            [X]  │
│  Upload Audio File                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  📁 tamil_petition_audio.mp3     2.5 MB  │ │
│  │                                           │ │
│  │  [▶] ─────●──────────────── 00:45/02:15  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │    ⏳ Transcribing...   (Spinner)         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5. Live Recording Mode - Ready to Record
```
┌─────────────────────────────────────────────────┐
│  Speech to Text                    [← Back] [X] │
│  Live Recording                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │              ┌─────────┐                  │ │
│  │              │    🎤   │                  │ │
│  │              │         │                  │ │
│  │              └─────────┘                  │ │
│  │                                           │ │
│  │         Click to Start Recording          │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6. Live Recording Mode - Recording in Progress
```
┌─────────────────────────────────────────────────┐
│  Speech to Text                    [← Back] [X] │
│  Live Recording                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │         🔴 Recording...                   │ │
│  │                                           │ │
│  │             00:23                         │ │
│  │          (Timer Display)                  │ │
│  │                                           │ │
│  │              ┌─────────┐                  │ │
│  │              │    ⏹️   │                  │ │
│  │              │  STOP   │                  │ │
│  │              └─────────┘                  │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7. Live Recording Mode - Recording Complete
```
┌─────────────────────────────────────────────────┐
│  Speech to Text                    [← Back] [X] │
│  Live Recording                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │         ✅ Recording complete             │ │
│  │                                           │ │
│  │             01:35                         │ │
│  │          (Final Duration)                 │ │
│  │                                           │ │
│  │  [▶] ─────●──────────────── 00:15/01:35  │ │
│  │      (Audio Player Controls)              │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌──────────────────┐  ┌───────────────────┐  │
│  │   Re-record 🔄   │  │  Submit 🎯        │  │
│  └──────────────────┘  └───────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 8. After Successful Transcription (Main Form)
```
┌─────────────────────────────────────────────────┐
│  Step 3: Petition Description                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Short Description *                            │
│  ┌───────────────────────────────────────────┐ │
│  │ Pothole repair needed...                  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Detailed Description *                         │
│  ┌──────────────────────────────────┐          │
│  │  🎤 Record Audio                 │          │
│  └──────────────────────────────────┘          │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Tamil: மெயின் ரோட்டில் உள்ள பெரிய       │ │
│  │ குழியை சரி செய்ய வேண்டும். அது           │ │
│  │ போக்குவரத்து பிரச்சனைகளை                │ │
│  │ ஏற்படுத்துகிறது.                         │ │
│  │                                           │ │
│  │ English Translation: We need to repair    │ │
│  │ the large pothole on Main Road. It is     │ │
│  │ causing traffic problems.                 │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│         [Previous]           [Next Step]        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Button States

### Record Audio Button (in main form)
```
Normal State:
┌──────────────────────────────────┐
│  🎤  Record Audio                │
└──────────────────────────────────┘

Hover State:
┌──────────────────────────────────┐
│  🎤  Record Audio  (Blue bg)     │
└──────────────────────────────────┘
```

### Submit Button States

```
Normal:
┌──────────────────────────────────┐
│  Submit for Transcription  🎯    │
└──────────────────────────────────┘

Loading:
┌──────────────────────────────────┐
│  ⏳ Transcribing...               │
└──────────────────────────────────┘

Disabled (no file):
┌──────────────────────────────────┐
│  Submit for Transcription (Gray) │
└──────────────────────────────────┘
```

## Toast Notifications

### Success
```
┌─────────────────────────────────────┐
│  ✅ Transcription successful         │
│  Your audio has been transcribed    │
│  and added to the description       │
└─────────────────────────────────────┘
```

### Recording Started
```
┌─────────────────────────────────────┐
│  🎤 Recording started                │
│  Speak clearly into your microphone │
└─────────────────────────────────────┘
```

### Recording Stopped
```
┌─────────────────────────────────────┐
│  Recording stopped                   │
│  You can now submit your recording  │
│  for transcription                  │
└─────────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────────┐
│  ❌ Transcription failed             │
│  Failed to transcribe audio.        │
│  Please try again.                  │
└─────────────────────────────────────┘
```

### File Selected
```
┌─────────────────────────────────────┐
│  File selected                       │
│  tamil_audio.mp3 is ready for       │
│  transcription                      │
└─────────────────────────────────────┘
```

## Color Scheme

- **Primary Blue:** Buttons, borders, focus states
- **Red:** Recording indicator, destructive actions
- **Green:** Success states, completed recording
- **Gray:** Disabled states, placeholder text
- **White:** Modal background, input fields

## Responsive Behavior

### Desktop (> 768px)
- Modal: 500px width
- Two-column card layout
- Full-size buttons

### Tablet (768px - 480px)
- Modal: 90% width
- Two-column card layout maintained
- Slightly smaller buttons

### Mobile (< 480px)
- Modal: 95% width
- Single-column card layout
- Full-width buttons
- Touch-friendly tap targets

## Accessibility Features

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader labels (sr-only spans)
- ✅ ARIA attributes on buttons
- ✅ Focus indicators visible
- ✅ High contrast colors
- ✅ Clear visual feedback
- ✅ Descriptive error messages

## Animation Details

- Modal fade-in: 200ms
- Button hover: 150ms
- Recording pulse: 1s infinite
- Spinner rotation: 1s infinite
- Toast slide-in: 300ms

---

This UI preview shows all possible states and interactions users will experience when using the audio transcription feature!
