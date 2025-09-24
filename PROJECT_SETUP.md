# Griev-ease: Citizen Petition Management System

A comprehensive platform for citizens to raise petitions and government officials to manage them efficiently.

## 🏗️ Architecture Overview

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **Authentication**: JWT tokens with OTP verification
- **Real-time Updates**: WebSocket connections

### Backend
- **API Server**: FastAPI (Python) - Port 8000
- **OTP Service**: FastAPI (Python) - Port 7000  
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT + bcrypt hashing
- **AI Classification**: Automated petition categorization
- **File Upload**: Support for evidence attachments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL database
- Git

### 1. Clone the Repository
```bash
git clone <YOUR_GIT_URL>
cd Griev-ease
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev
```

### 3. Backend Setup

#### Install Python Dependencies
```bash
cd backend/DataBase
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-multipart bcrypt python-jose passlib aiofiles python-dotenv

cd ../
pip install fastapi uvicorn python-multipart aiosmtplib python-dotenv certifi
```

#### Configure Environment
Create `.env` file in `/backend/` directory:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/griev_ease_db

# Email Configuration (for OTP service)
ROOT_EMAIL=your-email@outlook.com
ROOT_PASS=your-app-password

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Start Backend Services
```bash
# Terminal 1: Start Main API Server (Port 8000)
cd backend/DataBase
python enhanced_main.py

# Terminal 2: Start OTP Service (Port 7000)  
cd backend
python OTP.py
```

## 📖 API Documentation

### Main API Endpoints (Port 8000)

#### Authentication
- `POST /auth/login` - User login with OTP verification
- `POST /auth/admin/login` - Officer/Admin login
- `POST /auth/register` - User registration
- `POST /checkuser` - Check if user exists (email/phone)

#### Petitions
- `GET /petitions` - List all petitions (admin)
- `POST /petitions` - Create new petition
- `GET /petitions/user/{user_id}` - User's petitions
- `PUT /petitions/{petition_id}/status` - Update petition status
- `DELETE /petitions/{petition_id}` - Delete petition

#### Admin Dashboard
- `GET /admin/statistics` - Dashboard statistics
- `GET /admin/officers` - List all officers
- `POST /admin/officers` - Register new officer

### OTP Service Endpoints (Port 7000)
- `POST /send-otp` - Send OTP to email
- `POST /verify-otp` - Verify OTP code

## 🎯 Key Features

### For Citizens
- **Secure Registration**: Phone/Email with OTP verification
- **Petition Creation**: Multi-step form with evidence upload
- **AI Classification**: Automatic department/category assignment
- **Real-time Updates**: Live status notifications via WebSocket
- **Petition Management**: View, edit, and track petition status

### For Officers/Admins  
- **Dashboard Analytics**: Comprehensive statistics and metrics
- **Petition Management**: Review, update, and resolve petitions
- **User Management**: Manage citizen and officer accounts
- **Department Assignment**: Organize petitions by departments
- **Escalation System**: Forward petitions to appropriate authorities

### Technical Features
- **Enhanced Authentication**: JWT + OTP two-factor security
- **AI-Powered Classification**: Smart petition categorization
- **Real-time Communication**: WebSocket for live updates
- **File Upload System**: Secure evidence attachment handling
- **Responsive Design**: Mobile-friendly interface
- **Database Migration**: Smooth transition from legacy schema

## 🛠️ Development

### Project Structure
```
Griev-ease/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── contexts/          # React Context providers  
│   └── lib/               # Utilities and helpers
├── backend/
│   ├── DataBase/          # Main API server
│   │   ├── enhanced_main.py      # FastAPI application
│   │   ├── enhanced_models.py    # SQLAlchemy models
│   │   └── ai_classification.py  # AI classification logic
│   └── OTP.py             # OTP service
└── static/                # Static assets
```

### Key Frontend Files
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/pages/PetitionCreatePage.tsx` - Multi-step petition creation
- `src/pages/AdminDashboard.tsx` - Admin interface with statistics
- `src/pages/MyPetitionsPage.tsx` - User petition management

### Key Backend Files
- `backend/DataBase/enhanced_main.py` - Main FastAPI server with all endpoints
- `backend/DataBase/enhanced_models.py` - Database models and relationships
- `backend/OTP.py` - Separate OTP verification service

## 🔧 Troubleshooting

### Common Issues

1. **404 Errors on API Calls**
   - Ensure both backend services are running (ports 8000 and 7000)
   - Check database connection and environment variables

2. **CORS Issues**
   - Backend is configured to allow all origins for development
   - For production, update CORS settings in both services

3. **Database Connection Errors**
   - Verify PostgreSQL is running and accessible
   - Check DATABASE_URL in environment configuration
   - Run database migrations if needed

4. **OTP Email Not Working**
   - Configure ROOT_EMAIL and ROOT_PASS in .env
   - For Outlook/Office365, use app-specific password
   - Check email service SMTP settings

### Testing the Application

1. Start all services (frontend + 2 backend services)
2. Visit http://localhost:8080
3. Test user registration with OTP verification
4. Create a petition and verify AI classification  
5. Login as admin to manage petitions

## 🚀 Production Deployment

### Environment Setup
- Use production database credentials
- Configure proper CORS origins  
- Set secure JWT secret keys
- Use production email service credentials
- Enable HTTPS for security

### Security Considerations
- Store sensitive data in environment variables
- Use HTTPS in production
- Implement rate limiting for OTP endpoints
- Regular security audits and updates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`  
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This project includes both legacy compatibility and enhanced features. The enhanced backend (`enhanced_main.py`) includes all modern features while maintaining backward compatibility with existing data.