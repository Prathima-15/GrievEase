# GrievEase - Enhanced Digital Petition Management System

## System Overview

GrievEase is a comprehensive digital platform for managing civic petitions and grievances. It consists of:

- **Frontend**: React + TypeScript with Vite
- **Backend**: FastAPI with PostgreSQL
- **OTP Service**: Separate FastAPI service for OTP verification
- **AI Classification**: Automated petition categorization

## Quick Start

### 1. Start Backend Services

Run the batch file to start both backend services:
```bash
start_backend.bat
```

Or start them manually:

**Terminal 1 - OTP Service:**
```bash
cd backend
python OTP.py
```

**Terminal 2 - Main API:**
```bash
cd backend/DataBase
python enhanced_main.py
```

### 2. Start Frontend

**Terminal 3 - Frontend:**
```bash
npm run dev
```

## Services Overview

### OTP Service (Port 7000)
- Handles OTP generation and verification
- Endpoints:
  - `POST /send-otp` - Send OTP to email
  - `POST /verify-otp` - Verify OTP code

### Main API (Port 8000)
- Handles all application logic
- Enhanced endpoints for better functionality
- Automatic AI classification of petitions

### Frontend (Port 5173)
- Modern React application
- Real-time updates via WebSocket
- Mobile-responsive design

## Key Features Fixed

### Authentication System
- ✅ Two-factor authentication with OTP
- ✅ Role-based access (User/Admin)
- ✅ Enhanced backend endpoints
- ✅ Proper token management

### Petition Management
- ✅ AI-powered classification
- ✅ Real-time status updates
- ✅ File upload support
- ✅ Enhanced backend data handling

### Admin Dashboard
- ✅ Comprehensive statistics
- ✅ Petition status management
- ✅ User and officer management
- ✅ Enhanced admin endpoints

### User Experience
- ✅ Fixed frontend to work with enhanced backend
- ✅ Proper error handling
- ✅ Real-time notifications
- ✅ Responsive design

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/admin/login` - Admin login
- `POST /auth/admin/register` - Register new officer (admin only)

### Petitions
- `POST /petitions/create` - Create petition with AI classification
- `GET /petitions/my` - Get user's petitions
- `GET /petitions/{id}` - Get petition details

### Admin
- `GET /admin/petitions` - Get all petitions (admin)
- `PUT /admin/petitions/{id}/status` - Update petition status
- `GET /admin/statistics` - Dashboard statistics
- `GET /admin/users` - Get all users
- `GET /admin/officers` - Get all officers

### Departments & Categories
- `GET /departments` - Get all departments
- `GET /categories` - Get all categories
- `POST /admin/departments` - Create department (admin only)

## Database Setup

Make sure PostgreSQL is running with:
- Database: `grievease_db`
- Username: `postgres`
- Password: `1234`
- Port: `5432`

The enhanced backend will automatically create tables on startup.

## Environment Variables

Create `.env` file in backend directory:
```
ROOT_EMAIL=your_email@outlook.com
ROOT_PASS=your_email_password
```

## Testing the System

### 1. User Flow
1. Sign up with new account (redirects to sign-in)
2. Sign in with email + password + OTP
3. Create petitions with AI classification
4. View petition status in real-time

### 2. Admin Flow
1. Sign in as admin with OTP
2. View dashboard with statistics
3. Manage petitions (accept/reject/resolve)
4. Register new officers
5. View analytics

## Status Workflow

Petitions follow this status workflow:
- `submitted` → `in_progress` → `resolved`
- `submitted` → `rejected`
- `in_progress` → `escalated`

## Real-time Features

- WebSocket connections for live updates
- Automatic petition status notifications
- Real-time dashboard statistics

## Key Improvements Made

1. **Backend Integration**: Fixed frontend to use enhanced FastAPI backend
2. **Authentication Flow**: Proper OTP-based login with token management
3. **API Consistency**: Updated all endpoints to match enhanced backend
4. **Error Handling**: Comprehensive error handling and user feedback
5. **Real-time Updates**: WebSocket integration for live updates
6. **Admin Features**: Complete admin dashboard with statistics
7. **Status Management**: Proper petition workflow with status transitions

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check PostgreSQL is running
2. **OTP not working**: Verify email credentials in .env
3. **Authentication failed**: Clear browser cookies and try again
4. **Database errors**: Ensure database exists and credentials are correct

### Development Tips

1. Use browser developer tools to monitor API calls
2. Check backend logs for detailed error messages
3. Verify WebSocket connections in Network tab
4. Test with different user roles (user vs admin)

## File Structure

```
Griev-ease/
├── backend/
│   ├── OTP.py                 # OTP service
│   └── DataBase/
│       ├── enhanced_main.py   # Main API
│       ├── enhanced_models.py # Database models
│       └── ai_classification.py # AI classifier
├── src/
│   ├── components/           # React components
│   ├── contexts/            # Auth context
│   ├── pages/               # Page components
│   └── hooks/               # Custom hooks
├── start_backend.bat        # Backend startup script
└── package.json            # Frontend dependencies
```

The system is now fully integrated and should work seamlessly with your enhanced backend and OTP service!