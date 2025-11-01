# 🤖 AI Verification Feature for Admin Updates

## Overview

The system now uses **Google Gemma-3-4b** model (via LMStudio) to verify admin status updates before they're saved to the database.

## How It Works

### 1. **Admin Updates Petition**
- Admin fills in status update form
- Admin comment (required)
- Proof files (optional)
- Clicks "Update Status & Upload Proof"

### 2. **AI Verification Step**
```
┌─────────────────────────────────────┐
│  Admin Submits Update               │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  🤖 AI Verification                 │
│  - Analyzes petition description    │
│  - Checks admin comment relevance   │
│  - Validates proof file names       │
│  - Checks professionalism           │
└──────────────┬──────────────────────┘
               ↓
        ┌──────┴──────┐
        │             │
   ✅ VALID      ❌ INVALID
        │             │
        ↓             ↓
  Confirm     Stop & Show
  & Submit     Reason
```

### 3. **AI Analysis**

The AI checks:
- ✅ **Relevance**: Does the comment address the petition issue?
- ✅ **Meaningfulness**: Does it provide useful update information?
- ✅ **Proof Files**: Are uploaded files relevant to petition type?
- ✅ **Professionalism**: Is the update genuine and professional?

### 4. **Verification Result**

**If VALID:**
```
✅ AI Confidence: 85%
Reason: The admin comment appropriately addresses the garbage 
        accumulation issue and mentions cleaning progress.
        
[Proceed with Update?]  [Cancel]
```

**If INVALID:**
```
❌ Verification Failed
Reason: The admin comment does not address the petition's issue 
        about road repairs. It mentions garbage collection instead.

💡 Suggestions: Please provide an update specifically about the 
                road repair status mentioned in the petition.
```

---

## Backend API

### Endpoint: `POST /admin/petitions/{petition_id}/verify-update`

**Request:**
```typescript
FormData {
  admin_comment: string,
  proof_files: File[]  // optional
}
```

**Response:**
```json
{
  "is_valid": true,
  "confidence": 85,
  "reason": "The update appropriately addresses the petition issue...",
  "suggestions": "Consider adding more specific details...",
  "ai_available": true
}
```

### AI Model Configuration

**LMStudio Settings:**
- **Model**: `google/gemma-3-4b`
- **URL**: `http://localhost:1234/v1/chat/completions`
- **Temperature**: 0.3 (for consistent, focused responses)
- **Max Tokens**: 500
- **Response Format**: JSON

### Prompt Template

```
PETITION DETAILS:
Title: [petition.title]
Description: [petition.description]
Category: [petition.category]
Department: [petition.department]

ADMIN UPDATE:
Comment: [admin_comment]
Proof Files: [file_names]

TASK:
Verify if the admin's update is relevant and appropriate.
Check: relevance, meaningfulness, proof files, professionalism.

Respond in JSON:
{
  "is_valid": true/false,
  "confidence": 0-100,
  "reason": "explanation",
  "suggestions": "improvement suggestions"
}
```

---

## Frontend Flow

### Updated `handleUpdateStatus()` Function

```typescript
const handleUpdateStatus = async () => {
  // 1. Validate admin comment exists
  if (!adminComment.trim()) {
    toast({ title: "Error", description: "Comment required" });
    return;
  }
  
  setVerifying(true);
  
  // 2. Call AI verification endpoint
  const verifyFormData = new FormData();
  verifyFormData.append('admin_comment', adminComment);
  proofFiles.forEach(file => verifyFormData.append('proof_files', file));
  
  const verifyResponse = await fetch(`/admin/petitions/${id}/verify-update`, {
    method: 'POST',
    body: verifyFormData
  });
  
  const verificationResult = await verifyResponse.json();
  
  // 3. Check AI decision
  if (!verificationResult.is_valid) {
    // ❌ Invalid - stop and show reason
    toast({ title: "Verification Failed", description: verificationResult.reason });
    return;
  }
  
  // 4. ✅ Valid - show confirmation
  const confirm = window.confirm(
    `AI Confidence: ${verificationResult.confidence}%\n` +
    `${verificationResult.reason}\n\nProceed?`
  );
  
  if (!confirm) return;
  
  // 5. Submit actual update
  const formData = new FormData();
  formData.append('status', newStatus);
  formData.append('admin_comment', adminComment);
  proofFiles.forEach(file => formData.append('proof_files', file));
  
  await fetch(`/admin/petitions/${id}/status`, {
    method: 'PUT',
    body: formData
  });
  
  toast({ title: "Success", description: "Status updated" });
};
```

---

## Error Handling

### Fail-Open Approach

If AI verification fails (LMStudio offline, timeout, error):
```json
{
  "is_valid": true,  // ✅ Allow update
  "confidence": 50,
  "reason": "AI verification unavailable - proceeding with manual review",
  "ai_available": false
}
```

**Why fail-open?**
- Don't block legitimate updates due to technical issues
- Admin can still make urgent updates
- AI is assistance, not a hard gate

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "LMStudio not available" | LMStudio not running | Start LMStudio server on port 1234 |
| "Timeout" | Model loading slow | Increase timeout or warm up model |
| "Invalid JSON" | Model response format | Handled gracefully - extracts key info |

---

## Testing

### Test Cases

**1. Valid Update:**
```
Petition: "Fix potholes on Main Street"
Comment: "Road repair work has started. Expected completion in 2 days."
Files: before_repair.jpg, crew_working.jpg
Result: ✅ VALID (confidence: 90%)
```

**2. Invalid Update:**
```
Petition: "Fix potholes on Main Street"
Comment: "Garbage collection completed successfully"
Files: garbage_truck.jpg
Result: ❌ INVALID - Comment doesn't match petition issue
```

**3. Spam/Irrelevant:**
```
Petition: "Street light not working"
Comment: "asdfghjkl random text"
Files: none
Result: ❌ INVALID - Unprofessional and meaningless
```

**4. AI Unavailable:**
```
(LMStudio offline)
Result: ✅ VALID (confidence: 50%) - Manual review recommended
```

---

## Benefits

### For Admins:
- ✅ **Catch mistakes** before submitting
- ✅ **Improve quality** of updates
- ✅ **Get suggestions** for better responses

### For Users:
- ✅ **Relevant updates** only
- ✅ **Higher quality** responses
- ✅ **Better trust** in system

### For System:
- ✅ **Data quality** maintained
- ✅ **Prevent spam** or irrelevant updates
- ✅ **Audit trail** of AI decisions

---

## Configuration

### Enable/Disable AI Verification

To disable AI verification (bypass and allow all updates):

**Backend** (`enhanced_main.py`):
```python
# Add at top of verify endpoint
if True:  # Set to False to enable verification
    return {
        "is_valid": True,
        "confidence": 100,
        "reason": "AI verification disabled",
        "ai_available": False
    }
```

**Frontend** (`PetitionDetailPage.tsx`):
```typescript
// Skip verification step
const ENABLE_AI_VERIFICATION = false;

if (!ENABLE_AI_VERIFICATION) {
  // Directly submit update
  await submitUpdate();
  return;
}
```

### Adjust AI Strictness

**More Lenient:**
```python
temperature: 0.5  # Higher = more creative/lenient
```

**More Strict:**
```python
temperature: 0.1  # Lower = more focused/strict
```

---

## Future Enhancements

1. **Store AI Decisions** in database for analytics
2. **Admin Override** option to bypass AI
3. **Multiple Language Support** for Tamil/Hindi comments
4. **Image Analysis** of proof files using vision models
5. **Learning from Admin Feedback** on AI decisions
6. **Confidence Threshold** settings per department

---

## Example Scenarios

### Scenario 1: Garbage Collection Petition

**Petition:**
- Title: "Garbage accumulation near Sona College"
- Description: "Serious garbage issue for several days..."

**Valid Admin Update ✅:**
```
Comment: "The cleaning process is still in progress. 
         Garbage removal team has been deployed."
Files: clean_team_working.jpg
AI: ✅ VALID (92% confidence)
```

**Invalid Admin Update ❌:**
```
Comment: "Road repairs completed"
Files: road_repair.jpg
AI: ❌ INVALID - Comment addresses different issue
```

### Scenario 2: Road Repair Petition

**Petition:**
- Title: "Pothole repairs needed on Highway 47"
- Description: "Multiple potholes causing accidents..."

**Valid Admin Update ✅:**
```
Comment: "Pothole filling work scheduled for tomorrow. 
         Materials have been procured."
Files: materials_ready.jpg, pothole_marked.jpg
AI: ✅ VALID (88% confidence)
```

---

## Monitoring

### Backend Logs
```
🤖 AI Verification Result for Petition #123:
   Valid: True
   Confidence: 85%
   Reason: Update appropriately addresses the petition issue
```

### Frontend Console
```javascript
console.log('🤖 AI Verification Result:', {
  is_valid: true,
  confidence: 85,
  reason: "...",
  ai_available: true
});
```

---

## Security Notes

- ✅ Only admins can trigger verification (JWT auth)
- ✅ AI runs on local LMStudio (no data sent to external APIs)
- ✅ Fail-open prevents blocking legitimate updates
- ✅ Verification result logged for audit

---

## Summary

The AI verification feature adds an intelligent quality check before admin updates are saved, ensuring:
- ✅ **Relevance** - Updates match petition issues
- ✅ **Quality** - Meaningful and professional responses
- ✅ **Trust** - Users receive appropriate updates
- ✅ **Safety** - Prevents spam or irrelevant updates

All powered by **Google Gemma-3-4b** running locally on LMStudio! 🚀
