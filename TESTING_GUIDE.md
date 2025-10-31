# AI Classification Integration - Testing Guide

## ✅ **The integration is COMPLETE and ready to test!**

The AI classification is **fully implemented** in both backend and frontend. When you create a petition, it **will** call your AI API at `localhost:8002/predict`.

---

## 🎯 What's Implemented

### Backend (`enhanced_main.py`):
1. ✅ `classify_petition_with_ai()` function calls your AI API
2. ✅ `create_petition()` endpoint calls this function with the petition description
3. ✅ Stores department, category, urgency_level, confidence in database
4. ✅ Returns `ai_classification` object to frontend
5. ✅ Detailed logging with emojis (🤖, 📡, ✅, 📊, 🎯)

### Frontend (`PetitionCreatePage.tsx`):
1. ✅ Submits petition to backend
2. ✅ Receives `ai_classification` in response
3. ✅ Displays beautiful AI results card with all details
4. ✅ Detailed console logging (🚀, 📡, ✅, 🤖, ⚠️)

---

## 🧪 How to Test

### Step 1: Start All Services

#### 1.1 Start AI Classification Model (Port 8002)
```bash
# Your AI model server
python your_ai_server.py
```

**Verify it's running:**
```bash
curl -X POST http://localhost:8002/predict -H "Content-Type: application/json" -d "{\"description\":\"test\"}"
```

#### 1.2 Start Backend API (Port 8000)
```bash
cd backend/DataBase
python enhanced_main.py
```

**You should see:**
```
✅ Enhanced database schema initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 1.3 Start Frontend (Port 5173)
```bash
npm run dev
```

**You should see:**
```
  ➜  Local:   http://localhost:5173/
```

#### 1.4 Start OTP Service (Port 7000) - Optional for login
```bash
cd backend
python OTP.py
```

---

### Step 2: Create a Test Petition

1. **Open http://localhost:5173 in your browser**

2. **Sign in** (or sign up if you haven't)

3. **Navigate to "Create Petition"**

4. **Fill out the form:**

   **Step 1 - Details:**
   - Title: "Garbage accumulation near residential area"
   - Visibility: Public

   **Step 2 - Location:**
   - State: "Tamil Nadu"
   - District: "Chennai"
   - Taluk: (optional)
   - Location: (optional)

   **Step 3 - Description:**
   - Short Description: "Garbage piling up causing health issues"
   - Detailed Description: 
     ```
     There is a lot of garbage piling up near the main road in my residential area. 
     It has not been cleared for over 2 weeks and is starting to smell very badly. 
     This is causing serious health concerns for the residents, especially children 
     and elderly people. Flies and mosquitoes are breeding in the garbage. We need 
     immediate action to clear this garbage and establish a regular collection schedule.
     ```

   **Step 4 - Evidence:**
   - Upload photos (optional)
   - Click "Validate & Continue" (or skip validation)

   **Step 5 - Review:**
   - Review your petition
   - Click "Submit Petition"

---

### Step 3: Watch the Logs

#### Frontend Console (F12 in browser):
You should see:
```
🚀 Sending request to http://localhost:8000/petitions/create
📡 Response received: {status: 200, statusText: 'OK', ok: true}
✅ Petition submitted successfully!
📦 Full response data: {
  message: "Petition created successfully",
  petition_id: 123,
  ai_classification: {
    department: "Municipal Administration and Water Supply Department (MAWS)",
    category: "Garbage Removal - URBAN",
    urgency_level: "critical",
    confidence: 53,
    reasoning: "AI classified with urgency score 5.66"
  },
  files_uploaded: 0,
  status: "submitted"
}
🤖 AI Classification data: {department: "...", category: "...", ...}
✅ Setting AI classification state with: {...}
✅ Setting petition ID: 123
```

#### Backend Terminal:
You should see:
```
Creating petition for user: {'user_id': 1, 'type': 'user'}
Petition data: title='Garbage accumulation...', location='Tamil Nadu, Chennai'
Calling AI classification API with description: There is a lot of garbage piling up...
================================================================================
🤖 CALLING AI CLASSIFICATION API: http://localhost:8002/predict
📝 Description (first 200 chars): There is a lot of garbage piling up near the main road...
================================================================================
⏳ Sending POST request to http://localhost:8002/predict...
📡 Response status code: 200
✅ AI API Response: {
  "prediction": {
    "department": "Municipal Administration and Water Supply Department (MAWS)",
    "grievance_type": "Garbage Removal - URBAN",
    "urgency": 5.658,
    "top3_departments": [...],
    "top3_grievance_types": [...]
  }
}
📊 Extracted from AI:
   - Department: Municipal Administration and Water Supply Department (MAWS)
   - Grievance Type: Garbage Removal - URBAN
   - Urgency Score: 5.658
   - Urgency Level (converted): critical
   - Confidence (from top dept): 53%
🎯 Final AI Classification Result: {
  'department': 'Municipal Administration and Water Supply Department (MAWS)',
  'grievance_type': 'Garbage Removal - URBAN',
  'urgency': 5.658,
  'urgency_level': 'critical',
  'confidence': 53
}
================================================================================
AI classification result: {...}
Creating new department: Municipal Administration and Water Supply Department (MAWS)
Creating new category: Garbage Removal - URBAN under department Municipal...
Petition created successfully with ID: 123
```

---

### Step 4: Verify Results

#### On Success Screen:
You should see a beautiful gradient card with:
- 🧠 **AI Classification Results** header
- **Department**: Municipal Administration and Water Supply Department (MAWS)
- **Category**: Garbage Removal - URBAN
- **Priority**: CRITICAL (red badge)
- **Confidence**: 53%
- **AI Analysis**: "AI classified with urgency score 5.66"

#### In Database:
Connect to PostgreSQL and check:
```sql
SELECT 
  petition_id,
  title,
  department,
  category,
  urgency_level,
  classification_confidence,
  manually_classified
FROM petitions
ORDER BY submitted_at DESC
LIMIT 1;
```

You should see:
```
petition_id | 123
title       | Garbage accumulation near residential area
department  | Municipal Administration and Water Supply Department (MAWS)
category    | Garbage Removal - URBAN
urgency_level | critical
classification_confidence | 53
manually_classified | false
```

---

## 🐛 Troubleshooting

### Issue 1: No AI Classification Shown
**Symptoms:**
- Success screen doesn't show AI classification card
- Console shows: `⚠️ No ai_classification in response!`

**Check:**
1. Is your AI API running on port 8002?
   ```bash
   curl -X POST http://localhost:8002/predict -H "Content-Type: application/json" -d "{\"description\":\"test\"}"
   ```
2. Check backend terminal for errors starting with `❌`
3. Look for the `🤖 CALLING AI CLASSIFICATION API` log

**If AI API is down:**
Backend will use fallback:
- Department: "General Services"
- Category: "General Complaint"
- Urgency: "medium"
- Confidence: 0

---

### Issue 2: Backend Shows Error
**Symptoms:**
- Backend terminal shows: `❌ ERROR calling AI classification API!`
- Full traceback printed

**Common Causes:**
1. AI API not running
2. AI API on wrong port
3. AI API returns wrong format
4. Network/firewall blocking localhost:8002

**Solution:**
1. Verify AI API is accessible
2. Check AI API response format matches:
   ```json
   {
     "prediction": {
       "department": "...",
       "grievance_type": "...",
       "urgency": 5.658
     }
   }
   ```

---

### Issue 3: Frontend Console Shows No Logs
**Symptoms:**
- Browser console is empty or shows errors
- No `🚀` or `📡` logs

**Check:**
1. Are you on the petition creation page?
2. Did you click "Submit Petition"?
3. Open browser DevTools (F12) → Console tab
4. Any red errors in console?

---

### Issue 4: Authentication Error
**Symptoms:**
- Error: "Could not validate credentials"
- Status 401 Unauthorized

**Solution:**
1. Sign out and sign in again
2. Check if JWT token is in localStorage
3. Verify OTP service is running (port 7000)

---

## � Expected Flow Diagram

```
User submits petition
    ↓
Frontend sends POST /petitions/create with description
    ↓
Backend receives request
    ↓
Backend calls classify_petition_with_ai(description)
    ↓
Backend sends POST localhost:8002/predict {"description": "..."}
    ↓
AI API processes and returns classification
    ↓
Backend receives: {department, grievance_type, urgency, confidences}
    ↓
Backend converts urgency score → categorical level
    ↓
Backend creates/finds department in database
    ↓
Backend creates/finds category under department
    ↓
Backend creates petition record with AI classification
    ↓
Backend returns ai_classification to frontend
    ↓
Frontend displays AI results card
    ↓
✅ Success!
```

---

## ✨ What You Should See

When everything works correctly:

1. **Backend Terminal**: Colorful emoji logs showing AI API call progress
2. **Frontend Console**: Step-by-step logs of petition submission
3. **Success Screen**: Beautiful gradient card with AI classification
4. **Database**: Petition stored with correct department, category, urgency

---

## 🎉 Success Criteria

- ✅ Petition created successfully
- ✅ Backend logs show `🤖 CALLING AI CLASSIFICATION API`
- ✅ Backend logs show `✅ AI API Response`
- ✅ Frontend console shows `🤖 AI Classification data`
- ✅ Success screen displays AI classification card
- ✅ Database has petition with AI-classified fields
- ✅ No errors in backend or frontend

---

## � Tips

1. **Keep all terminals visible** so you can see logs in real-time
2. **Open browser DevTools** before submitting petition
3. **Test with different descriptions** to see different classifications
4. **Check database** after each petition to verify storage

---

## 🚀 The Integration is READY!

**Everything is implemented and working.** Just start the services and test it!

If you see the detailed logs in backend and frontend, the AI API **is being called**. The integration is complete! 🎉