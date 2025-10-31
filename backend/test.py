import json

# Assuming `response` is your JSON object
response = {
  "metadata": {
    "audio_duration": 16.8,
    "number_of_distinct_channels": 1,
    "billing_time": 16.8,
    "transcription_time": 15.501
  },
  "transcription": {
    "utterances": [
      {
        "words": [
          {
            "word": "திரை",
            "start": 1.184,
            "end": 1.384,
            "confidence": 0.84
          },
          {
            "word": " திலவியா",
            "start": 1.444,
            "end": 1.885,
            "confidence": 0.5
          },
          {
            "word": " திருவிலாவை",
            "start": 1.965,
            "end": 2.485,
            "confidence": 0.94
          },
          {
            "word": " முன்னிட்டு",
            "start": 2.545,
            "end": 2.966,
            "confidence": 0.98
          },
          {
            "word": " வாலபாடி,",
            "start": 3.006,
            "end": 3.586,
            "confidence": 0.99
          }
        ],
        "text": "திரை திலவியா திருவிலாவை முன்னிட்டு வாலபாடி,",
        "language": "ta",
        "start": 1.184,
        "end": 3.586,
        "channel": 0,
        "confidence": 0.85
      },
      {
        "words": [
          {
            "word": " ஜல்லிக்கட்டு",
            "start": 4.027,
            "end": 4.568,
            "confidence": 0.89
          },
          {
            "word": " விலா",
            "start": 4.646,
            "end": 4.908,
            "confidence": 0.95
          },
          {
            "word": " நென்று",
            "start": 4.967,
            "end": 5.307,
            "confidence": 0.8
          },
          {
            "word": " நடைபெற்ற",
            "start": 5.389,
            "end": 5.83,
            "confidence": 0.93
          },
          {
            "word": " வருகிறது.",
            "start": 5.869,
            "end": 6.428,
            "confidence": 0.97
          }
        ],
        "text": "ஜல்லிக்கட்டு விலா நென்று நடைபெற்ற வருகிறது.",
        "language": "ta",
        "start": 4.027,
        "end": 6.428,
        "channel": 0,
        "confidence": 0.91
      },
      {
        "words": [
          {
            "word": " இதில்",
            "start": 6.65,
            "end": 6.889,
            "confidence": 0.99
          },
          {
            "word": " ஐனருக்கும்",
            "start": 6.928,
            "end": 7.389,
            "confidence": 0.8
          },
          {
            "word": " மேற்பட்ட",
            "start": 7.432,
            "end": 7.869,
            "confidence": 0.83
          },
          {
            "word": " காலைகள்,",
            "start": 7.932,
            "end": 8.373,
            "confidence": 0.99
          }
        ],
        "text": "இதில் ஐனருக்கும் மேற்பட்ட காலைகள்,",
        "language": "ta",
        "start": 6.65,
        "end": 8.373,
        "channel": 0,
        "confidence": 0.9
      },
      {
        "words": [
          {
            "word": " நானவருக்கும்",
            "start": 8.412,
            "end": 9.092,
            "confidence": 0.79
          },
          {
            "word": " மேற்பட்ட",
            "start": 9.131,
            "end": 9.631,
            "confidence": 0.86
          },
          {
            "word": " மாடுபிளி",
            "start": 9.732,
            "end": 10.131,
            "confidence": 0.83
          },
          {
            "word": " வீரோகள்",
            "start": 10.17,
            "end": 10.592,
            "confidence": 0.69
          },
          {
            "word": " பங்கேட்டுள்ளனர்.",
            "start": 10.654,
            "end": 11.396,
            "confidence": 0.89
          }
        ],
        "text": "நானவருக்கும் மேற்பட்ட மாடுபிளி வீரோகள் பங்கேட்டுள்ளனர்.",
        "language": "ta",
        "start": 8.412,
        "end": 11.396,
        "channel": 0,
        "confidence": 0.81
      },
      {
        "words": [
          {
            "word": " இந்த",
            "start": 11.912,
            "end": 12.092,
            "confidence": 0.74
          },
          {
            "word": " ஜல்லிக்கட்டு",
            "start": 12.131,
            "end": 12.615,
            "confidence": 0.9
          },
          {
            "word": " விளையிலா",
            "start": 12.639,
            "end": 13.014,
            "confidence": 0.6
          },
          {
            "word": " போட்டியை",
            "start": 13.1,
            "end": 13.553,
            "confidence": 0.96
          }
        ],
        "text": "இந்த ஜல்லிக்கட்டு விளையிலா போட்டியை",
        "language": "ta",
        "start": 11.912,
        "end": 13.553,
        "channel": 0,
        "confidence": 0.8
      },
      {
        "words": [
          {
            "word": " சுற்றலாத்துரையாமேச்சி",
            "start": 14.053,
            "end": 15.1,
            "confidence": 0.69
          },
          {
            "word": " ராஜேந்திரம்",
            "start": 15.178,
            "end": 15.701,
            "confidence": 0.72
          },
          {
            "word": " தொடங்கி",
            "start": 15.717,
            "end": 16.021,
            "confidence": 0.84
          },
          {
            "word": " வைத்தார்",
            "start": 16.037,
            "end": 16.42,
            "confidence": 0.92
          }
        ],
        "text": "சுற்றலாத்துரையாமேச்சி ராஜேந்திரம் தொடங்கி வைத்தார்",
        "language": "ta",
        "start": 14.053,
        "end": 16.42,
        "channel": 0,
        "confidence": 0.79
      }
    ],
    "full_transcript": "திரை திலவியா திருவிலாவை முன்னிட்டு வாலபாடி, ஜல்லிக்கட்டு விலா நென்று நடைபெற்ற வருகிறது. இதில் ஐனருக்கும் மேற்பட்ட காலைகள், நானவ            வருக்கும் மேற்பட்ட மாடுபிளி வீரோகள் பங்கேட்டுள்ளனர். இந்த ஜல்லிக்கட்டு விளையிலா போட்டியை சுற்றலாத்துரையாமேச்சி ராஜேந்திரம் தொடங்கி வைத்தார்",
    "languages": [
      "ta"
    ]
  },
  "punctuation_enhanced": {
    "exec_time": 0,
    "results": [],
    "is_empty": True,
    "success": False,
    "error": {
      "message": "Model unavailable",
      "status_code": 404
    }
  },
  "translation": {
    "success": True,
    "is_empty": False,
    "results": [
      {
        "languages": [
          "en"
        ],
        "full_transcript": "The Jallikattu event is being conducted in Valapady, in celebration of the Thiruvila festival. More than five hundred bulls and over four hundred bullfighters participated. The Tourism Minister, Mr. Rajendran, inaugurated this Jallikattu competition.",
        "utterances": [
          {
            "words": [
              {
                "word": "The",
                "start": 1.184,
                "end": 1.384,
                "confidence": 0.84
              },
              {
                "word": " Jallikattu",
                "start": 1.444,
                "end": 1.885,
                "confidence": 0.5
              },
              {
                "word": " event",
                "start": 1.965,
                "end": 2.485,
                "confidence": 0.94
              },
              {
                "word": " is being",
                "start": 2.545,
                "end": 2.966,
                "confidence": 0.98
              },
              {
                "word": " conducted",
                "start": 3.006,
                "end": 3.586,
                "confidence": 0.99
              }
            ],
            "text": "The Jallikattu event is being conducted",
            "language": "en",
            "start": 1.184,
            "end": 3.586,
            "channel": 0,
            "confidence": 0.85
          },
          {
            "words": [
              {
                "word": " in Valapady,",
                "start": 4.027,
                "end": 4.568,
                "confidence": 0.89
              },
              {
                "word": " in celebration",
                "start": 4.646,
                "end": 4.908,
                "confidence": 0.95
              },
              {
                "word": " of the",
                "start": 4.967,
                "end": 5.307,
                "confidence": 0.8
              },
              {
                "word": " Thiruvila",
                "start": 5.389,
                "end": 5.83,
                "confidence": 0.93
              },
              {
                "word": " festival.",
                "start": 5.869,
                "end": 6.428,
                "confidence": 0.97
              }
            ],
            "text": " in Valapady, in celebration of the Thiruvila festival.",
            "language": "en",
            "start": 4.027,
            "end": 6.428,
            "channel": 0,
            "confidence": 0.908
          },
          {
            "words": [
              {
                "word": " More than",
                "start": 6.65,
                "end": 6.889,
                "confidence": 0.99
              },
              {
                "word": " five",
                "start": 6.928,
                "end": 7.389,
                "confidence": 0.8
              },
              {
                "word": " hundred",
                "start": 7.432,
                "end": 7.869,
                "confidence": 0.83
              },
              {
                "word": " bulls",
                "start": 7.932,
                "end": 8.373,
                "confidence": 0.99
              }
            ],
            "text": " More than five hundred bulls",
            "language": "en",
            "start": 6.65,
            "end": 8.373,
            "channel": 0,
            "confidence": 0.9025
          },
          {
            "words": [
              {
                "word": " and over",
                "start": 8.412,
                "end": 9.092,
                "confidence": 0.79
              },
              {
                "word": " four",
                "start": 9.131,
                "end": 9.631,
                "confidence": 0.86
              },
              {
                "word": " hundred",
                "start": 9.732,
                "end": 10.131,
                "confidence": 0.83
              },
              {
                "word": " bullfighters",
                "start": 10.17,
                "end": 10.592,
                "confidence": 0.69
              },
              {
                "word": " participated.",
                "start": 10.654,
                "end": 11.396,
                "confidence": 0.89
              }
            ],
            "text": " and over four hundred bullfighters participated.",
            "language": "en",
            "start": 8.412,
            "end": 11.396,
            "channel": 0,
            "confidence": 0.8119999999999999
          },
          {
            "words": [
              {
                "word": " The Tourism",
                "start": 11.912,
                "end": 12.092,
                "confidence": 0.74
              },
              {
                "word": " Minister,",
                "start": 12.131,
                "end": 12.615,
                "confidence": 0.9
              },
              {
                "word": " Mr.",
                "start": 12.639,
                "end": 13.014,
                "confidence": 0.6
              },
              {
                "word": " Rajendran,",
                "start": 13.1,
                "end": 13.553,
                "confidence": 0.96
              }
            ],
            "text": " The Tourism Minister, Mr. Rajendran,",
            "language": "en",
            "start": 11.912,
            "end": 13.553,
            "channel": 0,
            "confidence": 0.8
          },
          {
            "words": [
              {
                "word": " inaugurated",
                "start": 14.053,
                "end": 15.1,
                "confidence": 0.69
              },
              {
                "word": " this",
                "start": 15.178,
                "end": 15.701,
                "confidence": 0.72
              },
              {
                "word": " Jallikattu",
                "start": 15.717,
                "end": 16.021,
                "confidence": 0.84
              },
              {
                "word": " competition.",
                "start": 16.037,
                "end": 16.42,
                "confidence": 0.92
              }
            ],
            "text": " inaugurated this Jallikattu competition.",
            "language": "en",
            "start": 14.053,
            "end": 16.42,
            "channel": 0,
            "confidence": 0.7925
          }
        ],
        "error": None
      }
    ],
    "exec_time": 2.5792192730307577,
    "error": None
  }
}

# Extract Tamil transcript

tamil_transcript = response.get("transcription", {}).get("full_transcript", "")

# Extract English transcript
english_transcript = ""
translation = response.get("translation", {})
if translation.get("success") and translation.get("results"):
    english_transcript = translation["results"][0].get("full_transcript", "")

print("Tamil Transcript:\n", tamil_transcript)
print("\nEnglish Transcript:\n", english_transcript)
