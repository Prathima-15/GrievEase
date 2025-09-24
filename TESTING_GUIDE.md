# Testing Guide: Admin Status Update with Proof Files

## 🚀 Quick Start Testing

### 1. Start Backend Server
```bash
cd backend/DataBase
python enhanced_main.py
```
Backend will start at: http://localhost:8000

### 2. Start Frontend Development Server
```bash
# In main project directory
npm run dev
```
Frontend will start at: http://localhost:5173

## 🧪 Manual Testing Steps

### Test Admin Status Update Feature:

1. **Login as Admin**
   - Navigate to sign-in page
   - Use admin credentials to login
   - Ensure you have admin privileges

2. **Access Petition Details**
   - Go to "Browse Petitions" or "My Petitions"
   - Click on any petition to view details
   - You should see the admin panel at the bottom (admin-only)

3. **Test Multiple Updates for Same Status**
   - Select "In Progress" status from dropdown
   - Add comment: "Day 1: Work has begun. Road cleaning completed."
   - Click "Add Update" (button should be enabled with comment)
   - Add another comment: "Day 2: Pothole filling started."
   - Click "Add Update" again (should work for same status)
   - Continue adding daily progress updates as needed

4. **Test Status Change with Files**
   - Select a different status (e.g., "Resolved")
   - Add detailed comment about completion
   - Upload proof files (completion photos, certificates)
   - Click "Update Status & Upload Proof"
   - Verify success message appears

5. **Verify Update History (Admin View)**
   - Check the "Update History" section
   - Should show all your updates with:
     - Timestamp
     - Status change
     - Your admin name
     - Comment text
     - Downloadable proof files

6. **Test User Transparency**
   - Logout and login as a regular user (petition owner)
   - View the same petition details
   - Check "Status Updates" section
   - Should see all updates (without admin names for privacy)
   - Should be able to download proof files

### Test File Upload Features:

- **Multi-file Upload**: Select multiple files at once
- **File Preview**: Files should appear with names before upload
- **File Removal**: Click X to remove files before submitting
- **File Download**: Click proof file names in history to download

## 🔧 Automated Testing

Run the test script:
```bash
cd backend/DataBase
python test_admin_updates.py
```

This will test:
- ✅ Status update API endpoint
- ✅ File upload functionality
- ✅ Update history retrieval
- ✅ Database integration

## 📊 Expected Results

### Successful Status Update:
```json
{
  "message": "Petition status updated successfully",
  "files_uploaded": 2,
  "file_names": ["proof1.jpg", "proof2.pdf"]
}
```

### Update History Response:
```json
[
  {
    "update_id": 1,
    "update_text": "Road repair work completed",
    "status": "resolved", 
    "officer_name": "Admin Name",
    "updated_at": "2024-01-15T10:30:00",
    "proof_files": ["work_completed.jpg", "completion_report.pdf"]
  }
]
```

## 🐛 Troubleshooting

### Common Issues:

1. **File Upload Fails**
   - Check file size (max 10MB per file)
   - Verify file type is allowed
   - Ensure backend server is running

2. **Admin Panel Not Visible**
   - Verify you're logged in as admin
   - Check user role in database
   - Refresh the page

3. **Database Errors**
   - Ensure PostgreSQL is running
   - Check database connection in enhanced_main.py
   - Run database migrations if needed

### Debug Mode:
- Check browser console for JavaScript errors
- Check backend terminal for API errors
- Verify file permissions in uploaded_proofs directory

## 📁 File Structure After Testing

```
uploaded_proofs/
├── petition_123_proof_1.jpg
├── petition_123_proof_2.pdf
└── petition_456_document.docx
```

Files are automatically renamed with petition ID prefix for organization.

## 🎯 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend connects to backend successfully  
- [ ] Admin can login and access admin panel
- [ ] Status dropdown shows all options
- [ ] File upload accepts multiple files
- [ ] Files can be removed before submission
- [ ] Status update saves to database
- [ ] Update history displays correctly
- [ ] Proof files can be downloaded
- [ ] Non-admin users cannot access admin features

## 📈 Performance Notes

- File uploads are processed synchronously
- Large files (>5MB) may take longer to upload
- Update history loads on page refresh
- Database queries are optimized for quick retrieval

## 🔐 Security Testing

- Verify only admins can update petition status
- Check file upload restrictions are enforced
- Ensure proof files are stored securely
- Test that update history is properly authenticated

This comprehensive testing approach ensures the admin status update feature works reliably in production!