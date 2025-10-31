# Quick Testing Guide - Browse Petitions Integration

## 🚀 Start Testing

### Step 1: Start Backend
```powershell
cd backend\DataBase
python enhanced_main.py
```

Wait for:
```
✅ Enhanced database schema initialized
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Start Frontend
```powershell
npm run dev
```

### Step 3: Open Browser
Navigate to: `http://localhost:5173/browse`

---

## ✅ What to Test

### 1. Initial Load
- [ ] Page loads without errors
- [ ] Petitions display (if any exist in database)
- [ ] Categories load in filter sidebar
- [ ] Departments load in filter sidebar
- [ ] Status filters show all 6 statuses

### 2. Search Feature
- [ ] Type in search box
- [ ] Results filter as you type
- [ ] Search works for title and description
- [ ] "Showing X of Y results" updates

### 3. Status Filters
- [ ] Check/uncheck different statuses
- [ ] Multiple statuses can be selected
- [ ] Petition count updates
- [ ] Default: Submitted, Under Review, In Progress are checked

### 4. Category Filters
- [ ] Categories loaded from database appear
- [ ] Can select multiple categories
- [ ] Filter updates petition list
- [ ] Scrollable if many categories

### 5. Department Filters (NEW!)
- [ ] Departments loaded from database appear
- [ ] Can select multiple departments
- [ ] Filter updates petition list
- [ ] Works together with other filters

### 6. Sorting
- [ ] Change sort dropdown
- [ ] Petitions reorder by:
  - Newest (default)
  - Oldest
  - Most Signatures

### 7. Pagination
- [ ] If >6 petitions, pagination appears
- [ ] Page numbers clickable
- [ ] Previous/Next buttons work
- [ ] Can't go before page 1 or after last page

### 8. Mobile View
- [ ] Resize browser to <1024px
- [ ] "Show/Hide Filters" button appears
- [ ] Filters toggle visibility
- [ ] Cards stack in single column

### 9. Petition Cards
- [ ] Status badge displays with correct color
- [ ] Date formatted nicely (e.g., "Apr 15, 2025")
- [ ] Title is clickable
- [ ] Description truncated to 2 lines
- [ ] Category badge shows
- [ ] Department badge shows (if exists)
- [ ] "View Details" button works

### 10. Reset Filters
- [ ] Apply several filters
- [ ] Click "Reset Filters"
- [ ] All filters return to defaults

---

## 🐛 Troubleshooting

### No Petitions Showing

**Issue:** "Showing 0 of 0 results"

**Solution:** No public petitions in database. Create some:

1. Sign in as a user
2. Create a petition
3. Make it public (or run SQL):
```sql
UPDATE petitions SET is_public = true WHERE petition_id = 1;
```

### Categories/Departments Empty

**Issue:** Filter sections show no options

**Solution:** Database doesn't have categories/departments:

```bash
cd backend\DataBase
python setup_basic_data.py
```

### 404 Error on Browse

**Issue:** Backend returns 404 for `/petitions/browse`

**Solution:** Ensure you're running `enhanced_main.py`, not `main.py`:
```powershell
cd backend\DataBase
python enhanced_main.py  # NOT main.py
```

### CORS Error

**Issue:** "Access to fetch blocked by CORS policy"

**Solution:** Check CORS settings in `enhanced_main.py`:
```python
allow_origins=["http://localhost:5173", ...],
```

---

## 📊 Sample API Tests

### Test Browse Endpoint Directly

```powershell
# Basic browse (should return public petitions)
curl http://localhost:8000/petitions/browse

# With search
curl "http://localhost:8000/petitions/browse?search=pothole"

# With status filter
curl "http://localhost:8000/petitions/browse?status=submitted"

# With category filter
curl "http://localhost:8000/petitions/browse?category=Infrastructure"

# With department filter
curl "http://localhost:8000/petitions/browse?department=Public%20Works"

# With sorting
curl "http://localhost:8000/petitions/browse?sort_by=oldest"

# With pagination
curl "http://localhost:8000/petitions/browse?skip=0&limit=6"

# Combined filters
curl "http://localhost:8000/petitions/browse?search=road&status=submitted&sort_by=newest&limit=6"
```

### Test Categories Endpoint

```powershell
curl http://localhost:8000/categories
```

Should return:
```json
[
  {
    "category_id": 1,
    "category_name": "Infrastructure",
    "category_code": "INFRA",
    ...
  }
]
```

### Test Departments Endpoint

```powershell
curl http://localhost:8000/departments
```

Should return:
```json
[
  {
    "department_id": 1,
    "department_name": "Public Works",
    "description": "..."
  }
]
```

---

## 🎯 Expected Behavior

### Happy Path Flow

1. **User opens browse page**
   - Sees list of public petitions
   - Filters load on left sidebar
   - 6 petitions per page shown

2. **User searches "road"**
   - Only petitions with "road" in title/description show
   - Count updates: "Showing 3 of 3 results"

3. **User filters by "Infrastructure" category**
   - Only infrastructure petitions show
   - Can combine with search

4. **User filters by "Public Works" department**
   - Only Public Works petitions show
   - Works with other filters

5. **User unchecks "Submitted" status**
   - Submitted petitions disappear
   - Only shows Under Review and In Progress

6. **User sorts by "Oldest"**
   - Petitions reorder
   - Oldest petition appears first

7. **User clicks "View Details"**
   - Navigates to petition detail page
   - Shows full petition information

---

## 📸 Screenshot Checklist

Take screenshots of:
- [ ] Browse page with petitions
- [ ] Search results
- [ ] Filters applied
- [ ] Empty state
- [ ] Mobile view
- [ ] Pagination

---

## ✨ Success Criteria

✅ Page loads without console errors  
✅ Petitions fetch from database  
✅ All filters work correctly  
✅ Search returns relevant results  
✅ Pagination works  
✅ Mobile responsive  
✅ Loading states show  
✅ Error handling works  
✅ Can navigate to petition details  

---

## 🔍 Console Debugging

Open Browser DevTools (F12) and check:

### Network Tab
- Look for `petitions/browse` request
- Should return 200 OK
- Check response JSON structure

### Console Tab
Should NOT see:
- ❌ CORS errors
- ❌ 404 errors
- ❌ TypeScript errors
- ❌ React warnings

May see (normal):
- ✅ "Petitions fetched: X"
- ✅ "Loading..." messages

---

## 📝 Next Steps After Testing

If everything works:
1. ✅ Mark feature as complete
2. ✅ Update documentation
3. ✅ Consider adding WebSocket for real-time updates
4. ✅ Implement signature system
5. ✅ Add more advanced filters

If issues found:
1. 🐛 Check console errors
2. 🐛 Verify backend is running
3. 🐛 Check database has public petitions
4. 🐛 Review API responses in Network tab
