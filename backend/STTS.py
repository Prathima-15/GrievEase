import asyncio
import json
import os
from typing import Any
import httpx
from time import sleep

# 🔹 Explicit Gladia API key and URL
GLADIA_API_KEY = "c12a192d-9353-42d3-b24c-cc69f3c27aa5"  # replace with your API key
GLADIA_API_URL = "https://api.gladia.io"

# 🔹 Audio file in the same directory
file_name = "MALad.wav"

# 🔹 Transcription config (Tamil + translation to English)
config = {
    "language_config": {
        "languages": ["ta"],  # Tamil
        "code_switching": True,
    },
    "diarization": False,
    "translation": True,
    "translation_config": {"target_languages": ["en"], "model": "base"},
    "punctuation_enhanced": True
}

async def run():
    _, file_extension = os.path.splitext(file_name)

    async with httpx.AsyncClient(timeout=300) as client:  # 5 minutes timeout
        with open(file_name, "rb") as f:
            file_content = f.read()

        headers = {
            "x-gladia-key": GLADIA_API_KEY,
            "accept": "application/json",
        }

        files = [("audio", (file_name, file_content, "audio/" + file_extension[1:]))]

        print("- Uploading file to Gladia...")
        upload_response: dict[str, Any] = (await client.post(
            url=f"{GLADIA_API_URL}/v2/upload/",
            headers=headers,
            files=files
        )).json()
        print("Upload response:", upload_response)
        audio_url = upload_response.get("audio_url")

        if not audio_url:
            print(f"No audio_url returned: {upload_response}")
            return

        data = {"audio_url": audio_url, **config}
        headers["Content-Type"] = "application/json"

        print("- Sending request to Gladia API...")
        post_response: dict[str, Any] = (await client.post(
            url=f"{GLADIA_API_URL}/v2/pre-recorded/",
            headers=headers,
            json=data
        )).json()
        print("Post response:", post_response)

        result_url = post_response.get("result_url")
        if not result_url:
            print(f"No result URL found in post response: {post_response}")
            return

        # Polling for results
        while True:
            print("Polling for results...")
            poll_response: dict[str, Any] = (await client.get(url=result_url, headers=headers)).json()
            response = {}

            if poll_response.get("status") == "done":
                print("- Transcription done ✅\n")
                response = poll_response.get("result")
                break
            elif poll_response.get("status") == "error":
                print("- Transcription failed ❌")
                print(poll_response)
                return
            else:
                print("Transcription status:", poll_response.get("status"))
            await asyncio.sleep(2)

        # Extract transcripts
        print("=" * 80)
        print("TRANSCRIPTION RESULTS")
        print("=" * 80)
        
        # Extract Tamil transcript
        tamil_transcript = ""
        if response and "transcription" in response:
            tamil_transcript = response["transcription"].get("full_transcript", "")
        
        # Extract English translation
        english_transcript = ""
        if response and "translation" in response:
            translation = response["translation"]
            if translation.get("success") and translation.get("results"):
                english_transcript = translation["results"][0].get("full_transcript", "")
        
        # Display results
        print("\n📝 TAMIL TRANSCRIPT:")
        print("-" * 80)
        print(tamil_transcript if tamil_transcript else "No Tamil transcript available")
        
        print("\n\n🔤 ENGLISH TRANSLATION:")
        print("-" * 80)
        print(english_transcript if english_transcript else "No English translation available")
        print("\n" + "=" * 80)


def main():
    asyncio.run(run())


if __name__ == "__main__":
    main()
