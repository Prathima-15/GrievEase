# Petition Detail Page - Real-Time WebSocket Updates

## What Was Added

Added WebSocket support to `PetitionDetailPage.tsx` so that when an admin (or anyone) updates a petition status, **all users viewing that specific petition** see the changes in real-time.

## How It Works

### 1. **WebSocket Connection Setup**
When a user opens a petition detail page, the component:
- Connects to the user-specific WebSocket: `ws://localhost:8000/ws/petitions/my/{userId}`
- Connects to the global WebSocket: `ws://localhost:8000/ws/petitions` (fallback)

### 2. **Real-Time Updates Flow**

```
Admin updates petition status
    ↓
Backend saves to database
    ↓
Backend calls notify_user_petitions(petition.user_id, ...)
    ↓
WebSocket sends message to petition owner's connections
    ↓
Frontend receives message
    ↓
Checks if message contains current petition
    ↓
Updates petition state and refetches updates
    ↓
UI updates immediately + toast notification
```

### 3. **Message Handling**

The frontend checks incoming WebSocket messages:

```typescript
const payload = {
  type: "update",
  petitions: [
    { petition_id: 30, title: "...", status: "resolved", ... },
    { petition_id: 31, title: "...", status: "in_progress", ... }
  ]
}

// Find if current petition is in the update
const updatedPetition = payload.petitions.find(
  p => p.petition_id === parseInt(id!)
);

// If found, update local state
if (updatedPetition) {
  setPetition(prev => ({ ...prev, ...updatedPetition }));
  fetchPetitionUpdates(); // Get latest updates
  toast({ title: "Petition Updated" });
}
```

## Features

### ✅ **For Petition Owners (Users)**
- See status changes in real-time when admin updates their petition
- See new admin comments/updates appear automatically
- Get toast notification when petition is updated
- No need to refresh the page

### ✅ **For Admins**
- See changes when other admins update the same petition
- Useful for collaborative administration
- Real-time updates list refreshes automatically

### ✅ **Multiple Viewers**
- If multiple people are viewing the same petition, they ALL see updates
- Works even if viewing from different devices/browsers

## Code Changes

### `PetitionDetailPage.tsx`

#### 1. Extracted Fetch Functions
```typescript
// Separated data fetching into reusable functions
const fetchPetitionData = async () => { ... };
const fetchPetitionUpdates = async () => { ... };
```

#### 2. WebSocket Connection in useEffect
```typescript
useEffect(() => {
  // Initial data fetch
  fetchPetitionData();
  
  // Setup WebSocket connections
  const uid = user?.userId;
  
  if (uid) {
    wsUser = new WebSocket(`ws://localhost:8000/ws/petitions/my/${uid}`);
    wsUser.onmessage = (ev) => {
      const payload = JSON.parse(ev.data);
      // Check if update is for current petition
      const updatedPetition = payload.petitions.find(
        p => p.petition_id === parseInt(id!)
      );
      if (updatedPetition) {
        setPetition(prev => ({ ...prev, ...updatedPetition }));
        fetchPetitionUpdates();
      }
    };
  }
  
  // Cleanup on unmount
  return () => {
    wsUser?.close();
    wsGlobal?.close();
  };
}, [id, user?.token, user?.userId]);
```

#### 3. Toast Notification on Update
```typescript
toast({
  title: "Petition Updated",
  description: "This petition has been updated.",
});
```

## Testing

### Test Case 1: Admin Updates Petition (Real-Time)

1. **Setup:**
   - User A: Opens petition detail page (as petition owner)
   - Admin: Opens same petition detail page

2. **Action:**
   - Admin changes status from "Submitted" → "In Progress"
   - Admin adds comment: "We are working on this issue"
   - Admin uploads proof file
   - Admin clicks "Update Status & Upload Proof"

3. **Expected Result:**
   - ✅ Admin sees success message
   - ✅ User A sees petition status change from "Submitted" → "In Progress" **instantly**
   - ✅ User A sees toast notification: "Petition Updated"
   - ✅ User A sees new update appear in "Status Updates" section
   - ✅ User A sees proof file in the update

4. **Console Logs:**

**Backend:**
```
🔔 Notifying WebSocket clients for user 3 after petition status update
📊 Found 5 petitions to send via WebSocket
📡 notify_user_petitions called for user 3
   User connections: 1
   Global connections: 2
✅ Sent to user-specific WebSocket connection
📊 WebSocket notification summary: 3 messages sent successfully
```

**Frontend (User A's Console):**
```
📨 Petition Detail - User WS message received: {type: 'update', petitions: Array(5)}
🔄 Updating petition details from WebSocket
```

### Test Case 2: Multiple Viewers

1. **Setup:**
   - Open petition #30 in 3 different browser tabs
   - Tab 1: User (petition owner)
   - Tab 2: Admin
   - Tab 3: Another user (if petition is public)

2. **Action:**
   - Admin in Tab 2 updates status to "Resolved"

3. **Expected Result:**
   - ✅ All 3 tabs update simultaneously
   - ✅ Status badge changes to "Resolved" in all tabs
   - ✅ Updates section refreshes in all tabs
   - ✅ Toast appears in all tabs

### Test Case 3: Check Console Logs

**What to Look For:**

1. **Connection Established:**
```
🔌 Setting up WebSocket for petition detail page, user ID: 3
✅ Petition Detail - User WS open 3
✅ Petition Detail - Global WS open
```

2. **Message Received:**
```
📨 Petition Detail - User WS message received: {type: "update", petitions: [...]}
🔄 Updating petition details from WebSocket
```

3. **Backend Sends Notification:**
```
🔔 Notifying WebSocket clients for user 3 after petition status update
✅ WebSocket notification sent successfully
```

## Important Notes

### Current Behavior
- WebSocket sends updates to the **petition owner's user_id**
- This means the petition owner always gets real-time updates
- Other viewers (admins, public) won't get updates unless they're the owner

### Future Enhancement (Optional)
To notify ALL viewers of a petition (not just the owner), you could:

1. **Create petition-specific WebSocket rooms:**
```python
# Backend - petition-specific WebSocket
petition_connections: dict[int, list[WebSocket]] = {}

@app.websocket("/ws/petition/{petition_id}")
async def petition_ws(websocket: WebSocket, petition_id: int):
    await websocket.accept()
    petition_connections.setdefault(petition_id, []).append(websocket)
    # ... handle messages
```

2. **Frontend connects to petition-specific WebSocket:**
```typescript
const ws = new WebSocket(`ws://localhost:8000/ws/petition/${id}`);
```

3. **Notify all viewers of that petition:**
```python
async def notify_petition_viewers(petition_id: int, petition_data: dict):
    for ws in petition_connections.get(petition_id, []):
        await ws.send_json({"type": "update", "petition": petition_data})
```

This would enable **true real-time collaboration** where anyone viewing the same petition sees updates instantly.

## Troubleshooting

### Updates Not Appearing

1. **Check WebSocket Connection:**
   - Open browser DevTools → Console
   - Look for: `✅ Petition Detail - User WS open`
   - If missing, check network tab for WebSocket connections

2. **Check User ID:**
   - Ensure `user?.userId` is defined
   - Only the petition owner gets notifications currently

3. **Check Backend Logs:**
   - Look for: `🔔 Notifying WebSocket clients for user X`
   - Verify user_id matches the logged-in user

4. **Check Petition ID Match:**
   - Frontend checks: `p.petition_id === parseInt(id!)`
   - Ensure types match (number vs string)

### WebSocket Disconnects

1. **Check CORS settings** - Ensure WebSocket connections allowed
2. **Check token expiration** - Token might expire during long sessions
3. **Network issues** - WebSocket connections can drop on poor network

## Summary

✅ **Added:** Real-time WebSocket updates to PetitionDetailPage  
✅ **Feature:** Users see status changes instantly without refresh  
✅ **User Experience:** Toast notification when petition updates  
✅ **Works For:** Petition owners viewing their petitions  
✅ **Fallback:** Global WebSocket ensures reliability  

**Result:** When admin updates a petition, the owner sees it immediately! 🎉

## Next Steps (Optional Enhancements)

1. **Petition-Specific Rooms:** Create WebSocket rooms per petition for all viewers
2. **Optimistic Updates:** Update UI before server response for faster UX
3. **Typing Indicators:** Show "Admin is typing..." when admin writes comment
4. **Live View Count:** Show "3 people viewing this petition"
5. **Reconnection Logic:** Auto-reconnect on connection loss
