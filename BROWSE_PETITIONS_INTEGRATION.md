# Browse Petitions Page - Database Integration

## Overview
Successfully integrated the Browse Petitions page with the backend database, replacing static mock data with real-time petition data from PostgreSQL.

## Changes Made

### 1. Backend API Enhancement

#### Added New Endpoint: `/petitions/browse`
**File:** `backend/DataBase/enhanced_main.py`

```python
@app.get("/petitions/browse")
def browse_petitions(
    db: Session = Depends(get_db),
    search: str = Query(default=None),
    status: str = Query(default=None),
    category: str = Query(default=None),
    department: str = Query(default=None),
    sort_by: str = Query(default="newest"),
    skip: int = Query(default=0),
    limit: int = Query(default=100)
):
```

**Features:**
- ✅ **Public petitions only** - Filters for `is_public = True`
- ✅ **Search functionality** - Searches in title, description, and short_description
- ✅ **Status filtering** - Filter by petition status
- ✅ **Category filtering** - Filter by category
- ✅ **Department filtering** - Filter by department
- ✅ **Sorting options:**
  - `newest` - Most recent petitions first (default)
  - `oldest` - Oldest petitions first
  - `most-signatures` - By petition_id (placeholder for signature count)
- ✅ **Pagination** - Supports `skip` and `limit` parameters
- ✅ **Total count** - Returns total number of matching petitions

**Response Format:**
```json
{
  "petitions": [
    {
      "petition_id": 1,
      "title": "Fix pothole on Main Street",
      "description": "Full description...",
      "short_description": "Brief summary...",
      "category": "Infrastructure",
      "department": "Public Works",
      "status": "submitted",
      "urgency_level": "high",
      "location": "Main Street, Bangalore",
      "submitted_at": "2025-04-15T10:30:00",
      "created_by": "John Doe",
      "signature_count": 0
    }
  ],
  "total_count": 25,
  "has_more": true
}
```

### 2. Frontend Component Update

#### File: `src/pages/BrowsePetitionsPage.tsx`

**Removed:**
- ❌ Static `MOCK_PETITIONS` array
- ❌ Hardcoded categories list
- ❌ Client-side filtering and sorting

**Added:**

#### a) TypeScript Interfaces
```typescript
interface Petition {
  petition_id: number;
  title: string;
  description: string;
  short_description: string;
  category: string;
  department: string;
  status: string;
  urgency_level: string;
  location: string;
  submitted_at: string;
  created_by: string;
  signature_count: number;
}

interface BrowseResponse {
  petitions: Petition[];
  total_count: number;
  has_more: boolean;
}
```

#### b) State Management
```typescript
const [petitions, setPetitions] = useState<Petition[]>([]);
const [categories, setCategories] = useState<string[]>([]);
const [departments, setDepartments] = useState<string[]>([]);
const [loading, setLoading] = useState(false);
const [totalCount, setTotalCount] = useState(0);
```

#### c) Data Fetching Functions

**1. Fetch Categories and Departments**
```typescript
const fetchCategoriesAndDepartments = async () => {
  const categoriesRes = await fetch('http://localhost:8000/categories');
  const departmentsRes = await fetch('http://localhost:8000/departments');
  // Populate filter options
};
```

**2. Fetch Petitions with Filters**
```typescript
const fetchPetitions = async () => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (sortBy) params.append('sort_by', sortBy);
  // Add filters...
  
  const response = await fetch(`http://localhost:8000/petitions/browse?${params}`);
  const data = await response.json();
  setPetitions(data.petitions);
};
```

#### d) Status Mapping
```typescript
const STATUS_COLORS = {
  'submitted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
  'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200',
  'escalated': 'bg-orange-100 text-orange-800 border-orange-200'
};

const STATUS_DISPLAY = {
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'in_progress': 'In Progress',
  'resolved': 'Resolved',
  'rejected': 'Rejected',
  'escalated': 'Escalated'
};
```

#### e) New Features Added

**1. Loading State**
```tsx
{loading ? (
  <div className="text-center py-12 bg-white rounded-lg shadow">
    <p className="text-gray-600">Loading petitions...</p>
  </div>
) : ...}
```

**2. Dynamic Filters**
- Status filters from backend statuses
- Category filters from database
- Department filters from database

**3. Real-time Search**
- Searches across title, description, and short_description
- Debounced for performance

**4. Enhanced Petition Cards**
```tsx
<Badge variant="outline" className="bg-blue-50">
  {petition.category}
</Badge>
{petition.department && (
  <Badge variant="outline" className="bg-purple-50">
    {petition.department}
  </Badge>
)}
```

**5. Date Formatting**
```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
```

## Features Implemented

### ✅ Search Functionality
- **Real-time search** across petition titles and descriptions
- **Backend-powered** using SQL ILIKE queries
- **Case-insensitive** matching

### ✅ Multi-Filter Support

#### Status Filters
- Submitted
- Under Review
- In Progress
- Resolved
- Rejected
- Escalated

#### Category Filters
- Dynamically loaded from database
- Multiple selection support
- Displays all available categories

#### Department Filters (NEW!)
- Dynamically loaded from database
- Multiple selection support
- Shows department assignments

### ✅ Sorting Options
- **Newest First** (default)
- **Oldest First**
- **Most Signatures** (placeholder for future feature)

### ✅ Pagination
- 6 petitions per page
- Page number navigation
- Previous/Next buttons
- Shows current page and total pages

### ✅ Responsive Design
- Mobile filter toggle
- Grid layout adjusts for screen size
- Scrollable filter sections

### ✅ Empty States
- Loading indicator
- No results message
- Reset filters button

## API Integration

### Endpoints Used

1. **GET /petitions/browse**
   - Main data source
   - Supports all filtering and pagination

2. **GET /categories**
   - Loads available categories
   - Used for filter options

3. **GET /departments**
   - Loads available departments
   - Used for filter options

### Query Parameters

```typescript
{
  search: "pothole",           // Search term
  status: "submitted",         // Filter by status
  category: "Infrastructure",  // Filter by category
  department: "Public Works",  // Filter by department
  sort_by: "newest",          // Sort order
  skip: 0,                    // Pagination offset
  limit: 6                    // Items per page
}
```

## Testing Guide

### 1. Start Backend
```bash
cd backend/DataBase
python enhanced_main.py
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Test Cases

#### a) Browse Public Petitions
1. Navigate to `/browse` or click "Browse Petitions"
2. Should see list of public petitions
3. Verify petition cards display correctly

#### b) Search Functionality
1. Enter search term in search box
2. Press Enter or wait for debounce
3. Results should filter in real-time

#### c) Status Filters
1. Check/uncheck status filters
2. Petition list updates immediately
3. Multiple statuses can be selected

#### d) Category Filters
1. Select one or more categories
2. Only matching petitions shown
3. Categories loaded from database

#### e) Department Filters (NEW)
1. Select one or more departments
2. Filter petitions by department
3. Departments loaded from database

#### f) Sorting
1. Change sort dropdown
2. Petitions reorder accordingly
3. Options: Newest, Oldest, Most Signatures

#### g) Pagination
1. If more than 6 petitions:
   - Page numbers appear
   - Click page numbers to navigate
   - Previous/Next buttons work
2. Page count updates with filters

#### h) Reset Filters
1. Apply multiple filters
2. Click "Reset Filters"
3. All filters clear to defaults

#### i) Mobile View
1. Resize browser to mobile width
2. Click "Show Filters" button
3. Filters toggle visibility

#### j) Click to View Details
1. Click "View Details" button
2. Navigate to petition detail page
3. Petition ID in URL matches

## Database Requirements

### Petitions Table
- Must have `is_public` field set to `true` for browsable petitions
- Fields used:
  - `petition_id`
  - `title`
  - `description`
  - `short_description`
  - `category`
  - `department`
  - `status`
  - `urgency_level`
  - `location`
  - `submitted_at`
  - `user_id` (for created_by lookup)

### Sample Data Setup
To test with sample petitions, ensure:
```sql
-- Make petitions public
UPDATE petitions SET is_public = true WHERE petition_id IN (1, 2, 3);

-- Verify public petitions exist
SELECT COUNT(*) FROM petitions WHERE is_public = true;
```

## Known Limitations & Future Enhancements

### Current Limitations
1. **Signature Count**: Returns 0 (not yet implemented in backend)
2. **Multiple Filters**: Backend accepts single category/department, client-side filters for multiple selections
3. **No WebSocket**: Browse page doesn't have real-time updates yet

### Future Enhancements
1. **Implement Signature System**
   - Add `signatures` table
   - Track user signatures
   - Display actual signature counts

2. **Advanced Search**
   - Search by location
   - Search by urgency level
   - Date range filters

3. **Real-Time Updates**
   - Add WebSocket for live petition updates
   - Show "New petition" notifications

4. **Petition Details Modal**
   - Quick view without navigation
   - Preview in browse page

5. **Social Features**
   - Share petition
   - Copy link
   - Social media integration

6. **Analytics**
   - Most viewed petitions
   - Trending petitions
   - Success rate by category

## Error Handling

### Frontend
```typescript
try {
  const response = await fetch('http://localhost:8000/petitions/browse?...');
  if (!response.ok) throw new Error('Failed to fetch');
  // Process data
} catch (error) {
  toast({
    title: "Error",
    description: "Failed to load petitions. Please try again.",
    variant: "destructive"
  });
}
```

### Backend
- Returns 500 with error details if database query fails
- Logs errors to console for debugging

## Performance Considerations

1. **Pagination**: Default limit of 100, frontend uses 6
2. **Debouncing**: Search triggers on input change (useEffect dependency)
3. **Lazy Loading**: Categories/departments loaded once on mount
4. **Efficient Queries**: Uses indexed fields (status, category, department)

## Console Logs for Debugging

```javascript
// Check API responses
console.log('Petitions fetched:', data.petitions.length);
console.log('Total count:', data.total_count);

// Check filter state
console.log('Selected statuses:', selectedStatuses);
console.log('Selected categories:', selectedCategories);
console.log('Selected departments:', selectedDepartments);
```

## Summary

✅ **Replaced** static mock data with real database petitions  
✅ **Added** new `/petitions/browse` API endpoint  
✅ **Implemented** search, filter, and sort functionality  
✅ **Added** department filters alongside category filters  
✅ **Maintained** all existing UI features  
✅ **Enhanced** with loading states and error handling  
✅ **Pagination** works with real data counts  
✅ **Type-safe** with TypeScript interfaces  

The Browse Petitions page is now fully integrated with the backend database! 🎉
