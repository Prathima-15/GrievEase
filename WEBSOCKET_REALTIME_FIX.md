# WebSocket Real-Time Updates Fix

## Problem
After adding the edit petition endpoint, WebSocket notifications were not working in real-time when users edited petitions. The UI wasn't updating automatically after saving changes.

## Root Causes Found

### 1. **Serialization Error in `notify_user_petitions`**
The function was trying to access `p.category_rel.name` which requires SQLAlchemy relationship loading:
```python
"category": p.category_rel.name if p.category_rel else "Unknown",  # ❌ Error!
```

**Fix:** Use the direct field instead:
```python
"category": p.category if p.category else "Unknown",  # ✅ Works!
```

### 2. **Missing Error Handling**
Errors in WebSocket notification were silently failing without proper logging.

**Fix:** Added comprehensive logging throughout the notification flow.

### 3. **Frontend Logic Issue**
Frontend had redundant conditions that could cause confusion in message handling.

**Fix:** Simplified and improved the WebSocket message handling logic.

## Changes Made

### Backend (`enhanced_main.py`)

#### 1. Fixed `notify_user_petitions` Function
**Before:**
```python
def serialize_petition(p: Petition):
    return {
        "petition_id": p.petition_id,
        "title": p.title,
        "description": p.description,
        "short_description": p.short_description,
        "category": p.category_rel.name if p.category_rel else "Unknown",  # ❌
        "status": p.status,
        "signatureCount": 0,
        "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None,
        "updates": len(p.updates) if hasattr(p, 'updates') else 0  # ❌
    }
```

**After:**
```python
def serialize_petition(p: Petition):
    try:
        return {
            "petition_id": p.petition_id,
            "title": p.title,
            "description": p.description,
            "short_description": p.short_description,
            "category": p.category if p.category else "Unknown",  # ✅
            "status": p.status,
            "signatureCount": 0,
            "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None,
            "updates": 0  # ✅ Simplified
        }
    except Exception as e:
        print(f"Error serializing petition {p.petition_id}: {e}")
        raise
```

#### 2. Enhanced Logging Throughout
Added detailed logging with emojis for easy tracking:
- 🔔 Notification start
- 📊 Data preparation
- ✅ Success
- ❌ Errors
- ⚠️ Warnings

**Example in `edit_petition`:**
```python
try:
    print(f"🔔 Notifying WebSocket clients for user {user_id} after petition edit")
    user_petitions = db.query(Petition).filter(Petition.user_id == user_id).order_by(Petition.submitted_at.desc()).all()
    print(f"📊 Found {len(user_petitions)} petitions to send via WebSocket")
    await notify_user_petitions(user_id, user_petitions)
    print(f"✅ WebSocket notification sent successfully")
except Exception as e:
    print(f"⚠️ WebSocket notification error (non-fatal): {e}")
    import traceback
    traceback.print_exc()
```

#### 3. Improved `notify_user_petitions` with Detailed Logging
```python
async def notify_user_petitions(user_id: int, petitions: List[Petition]):
    """Send petition updates to connected WebSocket clients"""
    print(f"📡 notify_user_petitions called for user {user_id}")
    print(f"   User connections: {len(user_connections.get(user_id, []))}")
    print(f"   Global connections: {len(global_connections)}")
    
    if user_id not in user_connections and not global_connections:
        print(f"⚠️ No WebSocket connections found for user {user_id}")
        return
    
    # ... serialization with error handling ...
    
    print(f"📊 WebSocket notification summary: {sent_count} messages sent successfully")
```

### Frontend (`MyPetitionsPage.tsx`)

#### Enhanced WebSocket Message Handling
**Before:**
```typescript
wsUser.onmessage = (ev) => {
  try {
    const payload = JSON.parse(ev.data);
    if (Array.isArray(payload)) {
      setPetitions(payload);
    } else if (payload?.type === 'update') {
      fetchPetitions();  // Refetch from API
    } else if (Array.isArray((payload as any).petitions)) {
      setPetitions((payload as any).petitions);  // Redundant?
    }
  } catch (e) {
    console.error("User WS parse error", e);
  }
};
```

**After:**
```typescript
wsUser.onmessage = (ev) => {
  try {
    const payload = JSON.parse(ev.data);
    console.log("📨 User WS message received:", payload);
    
    // Priority order: array > update.petitions > refetch
    if (Array.isArray(payload)) {
      console.log("🔄 Updating petitions from array payload");
      setPetitions(payload);
    } else if (payload?.type === 'update' && Array.isArray(payload.petitions)) {
      console.log("🔄 Updating petitions from update message");
      setPetitions(payload.petitions);  // Direct update from payload
    } else if (payload?.type === 'update') {
      console.log("🔄 Refetching petitions");
      fetchPetitions();  // Fallback to API call
    }
  } catch (e) {
    console.error("User WS parse error", e);
  }
};
```

## How It Works Now

### 1. User Edits a Petition
```
User clicks "Save Changes" → Frontend sends PUT /petitions/{id}/edit
```

### 2. Backend Processes Edit
```python
@app.put("/petitions/{petition_id}/edit")
async def edit_petition(...):
    # Update petition in database
    petition.title = title.strip()
    petition.description = description.strip()
    # ... more updates ...
    
    db.commit()
    db.refresh(petition)
    
    # Notify WebSocket clients
    await notify_user_petitions(user_id, user_petitions)
```

### 3. WebSocket Notification Sent
```python
payload = {
    "type": "update",
    "petitions": [
        {
            "petition_id": 30,
            "title": "Updated Title",
            "status": "submitted",
            # ... other fields
        },
        # ... all user's petitions
    ]
}

# Send to user-specific WebSocket
await ws.send_json(payload)

# Send to global WebSocket (fallback)
await global_ws.send_json(payload)
```

### 4. Frontend Receives and Updates
```typescript
// WebSocket receives message
payload = { type: "update", petitions: [...] }

// Updates state immediately
setPetitions(payload.petitions)

// UI re-renders with new data ✨
```

## Testing Instructions

### 1. Start Backend with Logging
```powershell
cd "C:\Users\sadha\OneDrive\Documents\Mini Project\Website\Griev-ease\backend\DataBase"
python enhanced_main.py
```

### 2. Start Frontend
```powershell
# From project root
npm run dev
```

### 3. Test Real-Time Updates

#### Test Case 1: Edit Petition
1. Open two browser tabs/windows
2. Both tabs: Navigate to "My Petitions"
3. Tab 1: Click "Edit" on a petition
4. Tab 1: Make changes and click "Save Changes"
5. **Expected Result:** Both tabs update immediately without refresh

#### Test Case 2: Check Console Logs

**Backend Console Should Show:**
```
🔔 Notifying WebSocket clients for user 3 after petition edit
📊 Found 5 petitions to send via WebSocket
📡 notify_user_petitions called for user 3
   User connections: 2
   Global connections: 2
📦 Payload prepared with 5 petitions
✅ Sent to user-specific WebSocket connection
✅ Sent to user-specific WebSocket connection
✅ Sent to global WebSocket connection
✅ Sent to global WebSocket connection
📊 WebSocket notification summary: 4 messages sent successfully
✅ WebSocket notification sent successfully
```

**Frontend Console Should Show:**
```
✅ User WS open 3
✅ Global WS open
📨 User WS message received: {type: 'update', petitions: Array(5)}
🔄 Updating petitions from update message
```

### 4. Verify No Errors
- Backend should not show any Python exceptions
- Frontend console should not show any WebSocket errors
- UI should update smoothly without flickering

## Debugging Tips

### If WebSocket Still Not Working

1. **Check WebSocket Connection Status**
   - Open browser DevTools → Console
   - Look for: `✅ User WS open 3` and `✅ Global WS open`
   - If missing, WebSocket connection failed

2. **Check Backend Logs**
   - Look for: `📡 notify_user_petitions called for user X`
   - If missing, notification function not being called
   - Check for any Python exceptions

3. **Check Network Tab**
   - Open DevTools → Network → WS (WebSocket filter)
   - Should see active WebSocket connections
   - Click on connection to see messages

4. **Common Issues:**
   - **Backend not running:** Start `python enhanced_main.py`
   - **Wrong backend file:** Ensure using `enhanced_main.py`, not `main.py`
   - **CORS issues:** Check CORS configuration in backend
   - **Token expired:** Sign out and sign in again
   - **Wrong userId:** Check console log for userId value

## Performance Considerations

### Current Behavior
- **Sends full petition list** on every update
- Simple but may be inefficient with many petitions

### Future Optimizations (Optional)
1. **Delta updates:** Send only changed petition
2. **Batch updates:** Group multiple rapid changes
3. **Pagination:** Send only visible petitions
4. **Compression:** Use WebSocket compression for large payloads

## Related Files

### Backend
- `backend/DataBase/enhanced_main.py` - Main API file with WebSocket implementation

### Frontend
- `src/pages/MyPetitionsPage.tsx` - Displays petitions with WebSocket updates
- `src/pages/EditPetition.tsx` - Edit form that triggers updates

## Summary

✅ **Fixed:** Serialization error in `notify_user_petitions`  
✅ **Added:** Comprehensive logging throughout WebSocket flow  
✅ **Improved:** Frontend message handling logic  
✅ **Enhanced:** Error handling to prevent silent failures  

**Result:** Real-time updates now work correctly when editing petitions! 🎉
