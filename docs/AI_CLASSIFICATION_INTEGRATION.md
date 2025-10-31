# AI Classification API Integration

## Overview

The petition creation system now integrates with an external AI classification API running at `localhost:8002/predict` to automatically classify petitions by department, grievance type, and urgency level.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │ POST /petitions/create
         │ (multipart/form-data)
         ▼
┌─────────────────┐
│   Backend API   │
│   (Port 8000)   │
│  enhanced_main  │
└────────┬────────┘
         │ POST /predict
         │ {"description": "..."}
         ▼
┌─────────────────┐
│  AI API Server  │
│   (Port 8002)   │
│  Classification │
│      Model      │
└─────────────────┘
```

## Implementation Details

### 1. AI Classification Helper Function

Location: `backend/DataBase/enhanced_main.py`

```python
async def classify_petition_with_ai(description: str) -> dict:
    """
    Call the AI classification API to classify petition
    
    Args:
        description: The petition description text
        
    Returns:
        dict with department, grievance_type, urgency score, and urgency_level
    """
```

**Features:**
- Async HTTP client using `httpx`
- 30-second timeout for API calls
- Error handling with fallback to default classification
- Urgency score (0-5) to categorical level conversion:
  - `0.0 - 1.99`: "low"
  - `2.0 - 2.99`: "medium"
  - `3.0 - 3.99`: "high"
  - `4.0 - 5.0`: "critical"

**Fallback Behavior:**
If the AI API fails or is unavailable, returns default classification:
```python
{
    "department": "General Services",
    "grievance_type": "General Complaint",
    "urgency": 2.5,
    "urgency_level": "medium",
    "confidence": 0
}
```

### 2. Updated Petition Creation Endpoint

**Changes:**
- Converted to `async def` to support `await` calls
- Calls `classify_petition_with_ai()` with petition description
- Auto-creates departments and categories if they don't exist in database
- Stores AI classification results in petition record

**Database Storage:**
The petition record stores:
- `department_id`: Foreign key to departments table
- `department`: Department name (for backward compatibility)
- `category_id`: Foreign key to categories table
- `category`: Grievance type from AI (for backward compatibility)
- `urgency_level`: Categorical level ("low", "medium", "high", "critical")
- `classification_confidence`: Confidence score (0-100)
- `manually_classified`: Set to `False` (AI classified)

### 3. API Contract

#### Input to AI API:
```json
POST http://localhost:8002/predict
Content-Type: application/json

{
  "description": "There is a lot of garbage piling up near the main road..."
}
```

#### Expected Response:
```json
{
  "prediction": {
    "department": "Municipal Administration and Water Supply",
    "grievance_type": "Garbage Removal - URBAN",
    "urgency": 4.308
  }
}
```

#### Response to Frontend:
```json
{
  "message": "Petition created successfully",
  "petition_id": 123,
  "ai_classification": {
    "department": "Municipal Administration and Water Supply",
    "category": "Garbage Removal - URBAN",
    "urgency_level": "critical",
    "confidence": 86,
    "reasoning": "AI classified with urgency score 4.31"
  },
  "files_uploaded": 2,
  "status": "submitted"
}
```

## Database Schema Updates

### Petition Table
The petition model already has all required fields:

```python
class Petition(Base):
    __tablename__ = "petitions"
    
    petition_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    
    # AI Classification fields
    department_id = Column(Integer, ForeignKey("departments.department_id"))
    department = Column(String(100))  # Backward compatibility
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    category = Column(String(100))  # Stores grievance_type
    
    urgency_level = Column(String(20))  # 'low', 'medium', 'high', 'critical'
    __table_args__ = (
        CheckConstraint(
            urgency_level.in_(['low', 'medium', 'high', 'critical']),
            name='urgency_level_check'
        ),
    )
    
    classification_confidence = Column(Integer)  # 0-100 score
    manually_classified = Column(Boolean, default=False)
    
    # Other fields...
```

### Department and Category Tables
- Auto-created if AI returns new departments/categories
- Linked via foreign keys to petition records

## Testing

### Test Script
Run the test script to verify the integration:

```bash
cd backend
python test_ai_classification.py
```

This will:
1. Test direct connection to AI API at localhost:8002
2. Verify response format and data parsing
3. Test urgency score to category conversion
4. Provide example curl command for testing petition creation

### Manual Testing Steps

1. **Start the AI API server** (port 8002)
   ```bash
   # Your AI model server
   python your_ai_server.py
   ```

2. **Start the backend API** (port 8000)
   ```bash
   cd backend/DataBase
   python enhanced_main.py
   ```

3. **Start the frontend** (port 5173)
   ```bash
   npm run dev
   ```

4. **Create a test petition:**
   - Navigate to petition creation page
   - Fill in title, description, location
   - Submit the form
   - Check the success screen for AI classification results

5. **Verify in database:**
   ```sql
   SELECT petition_id, title, department, category, urgency_level, 
          classification_confidence, manually_classified
   FROM petitions
   ORDER BY submitted_at DESC
   LIMIT 5;
   ```

## Error Handling

### AI API Unavailable
- If AI API is down or unreachable, petition creation still succeeds
- Falls back to "General Services" department with "medium" urgency
- Sets `classification_confidence` to 0

### Invalid Response Format
- If AI API returns unexpected format, uses fallback classification
- Logs error for debugging: `print(f"AI Classification API error: {status_code}")`

### Network Timeout
- 30-second timeout configured on HTTP client
- Catches timeout exceptions and uses fallback

### Database Errors
- Auto-creates departments and categories as needed
- Commits department/category before creating petition
- Uses database transactions for atomic operations

## Configuration

### AI API URL
Set in `enhanced_main.py`:
```python
AI_CLASSIFICATION_URL = "http://localhost:8002/predict"
```

To change the AI API endpoint, update this constant.

### Timeout Settings
Adjust timeout in `classify_petition_with_ai()`:
```python
async with httpx.AsyncClient(timeout=30.0) as client:
```

## Monitoring

### Logs to Check
The backend logs show:
```
Creating petition for user: {...}
Calling AI classification API with description: There is a lot of garbage...
AI classification result: {'department': 'Municipal...', 'urgency_level': 'critical'...}
Creating new department: Municipal Administration and Water Supply
Creating new category: Garbage Removal - URBAN under department Municipal...
Petition created successfully with ID: 123
```

### Common Issues

**Issue**: "Cannot connect to AI API"
- **Solution**: Verify AI server is running on port 8002
- **Check**: `curl http://localhost:8002/predict -X POST -H "Content-Type: application/json" -d '{"description":"test"}'`

**Issue**: "Department/Category not found"
- **Solution**: Auto-creation is enabled, check database permissions
- **Verify**: User has INSERT permission on departments and categories tables

**Issue**: "Urgency level constraint violation"
- **Solution**: Check urgency score to category conversion logic
- **Verify**: Urgency score from AI is between 0-5

## Frontend Integration

The frontend `PetitionCreatePage.tsx` already expects `ai_classification` in the response and displays it on the success screen:

```typescript
// Success screen shows:
<div className="space-y-2 text-sm text-muted-foreground">
  <div className="flex items-center gap-2">
    <Building className="h-4 w-4" />
    <span>Department: {aiClassification.department}</span>
  </div>
  <div className="flex items-center gap-2">
    <FileText className="h-4 w-4" />
    <span>Category: {aiClassification.category}</span>
  </div>
  <div className="flex items-center gap-2">
    <AlertCircle className="h-4 w-4" />
    <span>Urgency: {aiClassification.urgency_level}</span>
  </div>
</div>
```

No frontend changes are required - it already supports this feature!

## Future Enhancements

1. **Confidence Threshold**: Only use AI classification if confidence > 70%
2. **Human Review**: Flag low-confidence classifications for manual review
3. **Model Versioning**: Track which AI model version classified each petition
4. **A/B Testing**: Compare AI vs manual classification accuracy
5. **Batch Classification**: Classify multiple petitions in one API call
6. **Caching**: Cache classification results for similar descriptions
7. **Feedback Loop**: Use officer corrections to improve AI model

## Dependencies

Add to `requirements.txt` (already included):
```
httpx>=0.24.0
```

Install:
```bash
pip install httpx
```
