# 🚀 Quick Start: AI Verification Setup

## Prerequisites

1. **LMStudio** installed and running
2. **Google Gemma-3-4b** model loaded in LMStudio
3. **Backend** and **Frontend** running

---

## Step 1: Setup LMStudio

### 1.1 Download & Install LMStudio
- Download from: https://lmstudio.ai/
- Install and open LMStudio

### 1.2 Load Gemma-3-4b Model
1. Open LMStudio
2. Go to **Search** tab
3. Search for: `google/gemma-3-4b`
4. Download the model (GGUF format recommended)
5. Load the model

### 1.3 Start Local Server
1. Go to **Local Server** tab
2. Select `google/gemma-3-4b` model
3. Click **Start Server**
4. Verify it's running on: `http://localhost:1234`

**Test the server:**
```bash
curl http://localhost:1234/v1/models
```

Should return:
```json
{
  "data": [
    {
      "id": "google/gemma-3-4b",
      ...
    }
  ]
}
```

---

## Step 2: Start Backend

```bash
cd backend/DataBase
python enhanced_main.py
```

**Verify endpoints:**
- Main API: `http://localhost:8000`
- Admin verification: `http://localhost:8000/admin/petitions/{id}/verify-update`

---

## Step 3: Start Frontend

```bash
npm run dev
```

**Verify frontend:**
- Frontend: `http://localhost:5173`

---

## Step 4: Test AI Verification

### 4.1 Create Test Petition (as User)
1. Sign in as regular user
2. Create petition:
   - Title: "Fix potholes on Main Street"
   - Description: "Multiple dangerous potholes causing accidents"
   - Category: Road & Transport

### 4.2 Update as Admin
1. Sign in as admin
2. Go to petition detail page
3. Fill admin update form:
   - **Status**: In Progress
   - **Comment**: "Road repair work has started"
   - **Proof Files**: Upload relevant images
4. Click **"Update Status & Upload Proof"**

### 4.3 Watch AI Verification
```
Button text changes:
"Update Status" → "🤖 Verifying with AI..." → Confirmation dialog
```

**Example Valid Result:**
```
✅ AI Confidence: 87%

The admin comment appropriately addresses the road repair 
issue mentioned in the petition. The update provides clear 
information about the progress.

[Proceed with Update?]  [Cancel]
```

**Example Invalid Result:**
```
❌ Verification Failed

The admin comment does not address the petition's issue 
about road repairs. It mentions garbage collection instead.

💡 Suggestions: 
Please provide an update specifically about the road repair 
status mentioned in the petition.
```

---

## Troubleshooting

### ❌ "LMStudio not available"

**Problem:** Backend can't connect to LMStudio

**Solution:**
1. Check LMStudio is running
2. Verify server started on port 1234
3. Test with: `curl http://localhost:1234/v1/models`

### ❌ "AI verification timed out"

**Problem:** Model taking too long to respond

**Solution:**
1. LMStudio → Settings → Increase timeout
2. Use smaller/faster model
3. Pre-warm model with test request

### ❌ "Invalid JSON response"

**Problem:** Model not returning JSON

**Solution:**
1. Verify model supports JSON output
2. Check LMStudio settings → Response format: JSON
3. Backend handles this gracefully (extracts text)

### ❌ Update blocked unnecessarily

**Problem:** AI incorrectly marking valid updates as invalid

**Solution:**
1. Adjust temperature in backend (currently 0.3)
2. Modify prompt to be more lenient
3. Admin can still proceed (confirmation dialog)

---

## Configuration

### Adjust AI Strictness

**Backend** (`enhanced_main.py` line ~1550):

```python
payload = {
    "model": "google/gemma-3-4b",
    "temperature": 0.3,  # Lower = stricter, Higher = more lenient
    "max_tokens": 500
}
```

**Recommended values:**
- **Strict**: 0.1 - 0.2
- **Balanced**: 0.3 - 0.4 (current)
- **Lenient**: 0.5 - 0.7

---

## Monitoring

### Backend Logs
Watch terminal running `enhanced_main.py`:
```
🤖 AI Verification Result for Petition #5:
   Valid: True
   Confidence: 85%
   Reason: Update appropriately addresses the petition issue
```

### Frontend Console
Open browser DevTools → Console:
```javascript
🤖 AI Verification Result: {
  is_valid: true,
  confidence: 85,
  reason: "...",
  ai_available: true
}
```

---

## Testing Scenarios

### ✅ Test Case 1: Valid Update
**Petition:** "Fix potholes on Main Street"  
**Admin Comment:** "Pothole repairs scheduled for tomorrow"  
**Expected:** ✅ VALID (high confidence)

### ❌ Test Case 2: Irrelevant Update
**Petition:** "Fix potholes on Main Street"  
**Admin Comment:** "Garbage collection completed"  
**Expected:** ❌ INVALID (explains mismatch)

### ⚠️ Test Case 3: LMStudio Offline
**Action:** Stop LMStudio server  
**Admin Update:** Any comment  
**Expected:** ✅ VALID (50% confidence, manual review message)

---

## Performance

**Typical Response Times:**
- AI Verification: 2-5 seconds
- Status Update (after verification): 0.5-1 second
- Total: 3-6 seconds

**Optimization Tips:**
1. Keep LMStudio server running (warm start)
2. Use quantized models (GGUF Q4 or Q5)
3. Ensure adequate RAM (4GB+ for Gemma-3-4b)

---

## Next Steps

After setup:
1. ✅ Test with various petition types
2. ✅ Monitor AI decisions in logs
3. ✅ Adjust temperature if needed
4. ✅ Train team on AI verification flow
5. ✅ Collect feedback from admins

---

## Support

**LMStudio Issues:**
- Discord: https://discord.gg/lmstudio
- Docs: https://lmstudio.ai/docs

**GrievEase Issues:**
- Check `AI_VERIFICATION_FEATURE.md` for detailed docs
- Review backend logs for errors
- Test with `curl` to isolate issues

---

## Summary

Your AI verification system is now ready! 🎉

**Workflow:**
```
Admin updates petition
    ↓
🤖 AI verifies relevance
    ↓
✅ Valid → Confirm → Submit
❌ Invalid → Show reason → Block
```

**Benefits:**
- Higher quality updates
- Prevent irrelevant responses
- Maintain user trust
- Powered by local AI (privacy-friendly!)
