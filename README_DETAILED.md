# Resume Scanner / CVScout

A comprehensive web-based application that helps job seekers evaluate how well their resume matches job descriptions. Upload your resume, paste a job description, and get an instant match score with actionable feedback.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [How It Works](#how-it-works)
- [File Format Support](#file-format-support)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Resume Scanner** (CVScout) is a full-stack web application designed to bridge the gap between job seekers and employers. The system analyzes resumes against job descriptions to:

- Calculate a match percentage score
- Identify matching and missing keywords
- Provide actionable suggestions for resume improvement
- Track scan history
- Enable recruiters to monitor usage patterns

The application is built with a modern tech stack featuring Express.js backend, React frontend, and MongoDB database.

---

## Features

### Core Features

✅ **User Authentication**
- Secure user registration and login
- JWT-based authentication
- Role-based access control (User/Admin)
- Password hashing with bcryptjs

✅ **Resume Upload & Parsing**
- Support for PDF, DOCX, and TXT file formats
- Automatic text extraction from various formats
- Secure file storage and processing

✅ **Resume-to-Job Matching**
- Intelligent keyword extraction from job descriptions
- Resume-to-job description comparison algorithm
- Comprehensive match percentage calculation
- Matching and missing keywords identification

✅ **AI-Driven Suggestions**
- Category-based improvement suggestions
- Skill gap analysis
- Formatted suggestions for quick reference

✅ **Scan History**
- Track all previous resume scans
- View historical match scores
- Re-visit past analysis results

✅ **Admin Dashboard** (Future Enhancement)
- Monitor application usage
- View user activity analytics
- Track system performance

---

## Tech Stack

### Frontend
- **Framework**: React 19.2.7
- **Build Tool**: Vite 8.1.1
- **Routing**: React Router DOM 7.18.1
- **UI Components**: Lucide React (icons)
- **Styling**: CSS3
- **Package Manager**: npm

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB 8.4.1 (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) 9.0.2
- **Security**: bcryptjs 2.4.3
- **CORS**: cors 2.8.5
- **File Processing**: 
  - multer 1.4.5 (file uploads)
  - pdf-parse 1.1.1 (PDF extraction)
  - mammoth 1.8.0 (DOCX extraction)
- **Environment**: dotenv 16.4.5
- **Development**: Nodemon 3.1.3

---

## Project Structure

```
resume-scanner/
├── README.md                           # Main documentation
├── backend/                            # Express.js backend
│   ├── package.json                   # Backend dependencies
│   ├── server.js                      # Entry point, Express setup
│   ├── controllers/
│   │   ├── authController.js          # Authentication logic
│   │   └── scanController.js          # Resume scanning logic
│   ├── middleware/
│   │   └── auth.js                    # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                    # User schema (email, password, role)
│   │   └── Scan.js                    # Scan result schema
│   ├── routes/
│   │   ├── auth.js                    # Auth routes (register, login)
│   │   └── scans.js                   # Scan routes (create, get history)
│   └── utils/
│       ├── scannerEngine.js           # Core matching algorithm
│       └── scannerEngine.test.js      # Unit tests
└── frontend/                          # React Vite frontend
    ├── package.json                   # Frontend dependencies
    ├── vite.config.js                # Vite configuration
    ├── index.html                    # HTML entry point
    ├── public/                       # Static assets
    ├── src/
    │   ├── main.jsx                  # React DOM render
    │   ├── App.jsx                   # Main app component
    │   ├── App.css                   # Global styles
    │   ├── index.css                 # Base styles
    │   ├── assets/                   # Images, fonts, etc.
    │   ├── components/
    │   │   └── ScanResult.jsx        # Scan results display component
    │   └── pages/
    │       ├── Auth.jsx              # Login/Register page
    │       └── Dashboard.jsx         # Main dashboard/upload page
    └── README.md                     # Frontend-specific documentation
```

---

## Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn** (v8 or higher)
- **MongoDB** (v4.4 or higher) - running locally or remote connection URI

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd resume-scanner
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file in the backend directory
touch .env
```

**Configure `.env` file** with the following variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/resume-scanner

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_this_in_production
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=./uploads
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

**Create `.env.local` file** (optional, for API endpoint configuration):

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: MongoDB Setup

Ensure MongoDB is running:

```bash
# On Windows (if using MongoDB installed locally)
mongod

# Or use MongoDB Atlas for cloud-hosted database
# Update MONGO_URI in backend/.env with your connection string
```

---

## Running the Application

### Start MongoDB (if using local instance)

```bash
mongod
```

### Start the Backend Server

```bash
cd backend
npm start          # Production mode
# OR
npm run dev        # Development mode with auto-reload (uses Nodemon)
```

Expected output:
```
Connected to MongoDB.
Server started on port 5000
```

### Start the Frontend Development Server

```bash
cd frontend
npm run dev        # Vite development server
```

Expected output:
```
VITE v8.1.1  ready in 123 ms

➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## Usage Guide

### 1. User Registration

1. Click **"Sign Up"** on the login page
2. Enter your email and password
3. Click **"Register"**
4. You'll be logged in automatically

### 2. Uploading a Resume

1. Navigate to the **Dashboard**
2. Click **"Upload Resume"** button
3. Select a file (PDF, DOCX, or TXT format)
4. Click **"Submit"**

### 3. Scanning Against Job Description

1. Paste the job description in the provided text area
2. Click **"Scan Resume"** or **"Analyze"**
3. Wait for the analysis to complete

### 4. Viewing Results

The scan result will display:
- **Match Score**: Percentage match between resume and job description
- **Matching Keywords**: Skills/terms found in both resume and JD
- **Missing Keywords**: Important terms from JD not in resume
- **Suggestions**: Category-based improvement recommendations

### 5. Accessing Scan History

1. Go to **"History"** or **"Previous Scans"** section
2. Click on any scan to view detailed results
3. Download or share scan results if available

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes

#### **Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### **Login User**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Scan Routes

#### **Create a Scan**
```http
POST /scans
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>

FormData:
  - resume: <file>
  - jobDescription: "Required skills: JavaScript, React, Node.js..."
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "resumeFileName": "resume.pdf",
  "matchScore": 85,
  "matchingKeywords": ["javascript", "react", "node.js"],
  "missingKeywords": ["typescript", "docker"],
  "suggestions": [
    {
      "category": "Skills",
      "message": "Consider adding TypeScript to your skills section"
    },
    {
      "category": "Technical",
      "message": "Docker experience would be beneficial"
    }
  ],
  "createdAt": "2026-08-16T10:30:00Z"
}
```

#### **Get User's Scan History**
```http
GET /scans
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "resumeFileName": "resume.pdf",
    "matchScore": 85,
    "createdAt": "2026-08-16T10:30:00Z"
  },
  ...
]
```

#### **Get Specific Scan Details**
```http
GET /scans/:scanId
Authorization: Bearer <JWT_TOKEN>
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `email` (unique)
- `createdAt` (for query optimization)

### Scan Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  resumeFileName: String (required),
  resumeText: String (required, full text from resume),
  jobDescriptionText: String (required),
  matchScore: Number (0-100, required),
  matchingKeywords: [String],
  missingKeywords: [String],
  suggestions: [
    {
      category: String,      // e.g., "Skills", "Experience", "Formatting"
      message: String        // Actionable suggestion
    }
  ],
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `userId` (for quick user scan retrieval)
- `createdAt` (for sorting)

---

## How It Works

### Resume Scanning Algorithm

The core scanning engine (`scannerEngine.js`) follows these steps:

#### 1. **Text Extraction**
- Reads uploaded file (PDF, DOCX, TXT)
- Extracts plain text content using specialized libraries
- Normalizes text (lowercase, trim whitespace)

#### 2. **Keyword Extraction from Job Description**

The system uses a two-tiered approach:

**Tier 1: Dictionary-Based Matching**
- Maintains a comprehensive **SKILLS_DICTIONARY** with 50+ technical and soft skills
- Examples: JavaScript, React, Node.js, MongoDB, AWS, Docker, etc.
- Uses regex patterns with word boundaries for accurate matching

**Tier 2: Frequency Analysis**
- Filters out common stopwords (articles, prepositions, etc.)
- Identifies words appearing 3+ times in the job description
- Extracts high-frequency domain-specific terms

#### 3. **Resume Keyword Matching**
- Searches for extracted job keywords in the resume text
- Case-insensitive matching to catch variations
- Builds two sets:
  - **Matching Keywords**: Found in both resume and JD
  - **Missing Keywords**: In JD but not in resume

#### 4. **Match Score Calculation**
```
Match Score = (Matching Keywords / Total JD Keywords) × 100
```

Example:
- Job Description Keywords: 15 total
- Matching Keywords: 12
- Match Score: (12/15) × 100 = **80%**

#### 5. **Suggestion Generation**
- Analyzes resume structure and content
- Provides category-based suggestions:
  - **Skills**: Missing technical skills
  - **Experience**: Relevant experience gaps
  - **Formatting**: Resume presentation improvements
  - **Keywords**: Specific missing keywords to add

### Key Files Responsible

- **[scannerEngine.js](backend/utils/scannerEngine.js)** - Core algorithm implementation
- **[scanController.js](backend/controllers/scanController.js)** - API request handling
- **[Scan.js](backend/models/Scan.js)** - Database schema
- **[ScanResult.jsx](frontend/src/components/ScanResult.jsx)** - Results UI component

---

## File Format Support

### Supported Formats

| Format | Library | Status |
|--------|---------|--------|
| **PDF** | pdf-parse | ✅ Fully Supported |
| **DOCX** | mammoth | ✅ Fully Supported |
| **TXT** | Native | ✅ Fully Supported |

### File Constraints

- **Maximum File Size**: 5 MB (configurable via `MAX_FILE_SIZE` in `.env`)
- **Accepted MIME Types**:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/plain`

### Processing Notes

- Large PDFs may take 10-30 seconds to process
- DOCX files with complex formatting may lose some styling
- Plain text files are processed immediately

---

## Security Features

### Implemented Security Measures

✅ **Password Security**
- Passwords are hashed using bcryptjs with salt rounds (10)
- Password comparison using secure crypto comparison

✅ **Authentication & Authorization**
- JWT tokens with configurable expiry (default: 7 days)
- Token validation middleware on protected routes
- Role-based access control (User/Admin)

✅ **CORS Protection**
- CORS middleware configured for frontend origin
- Prevents unauthorized cross-origin requests

✅ **File Upload Security**
- File type validation before processing
- File size limits enforced
- Multer middleware for secure file handling
- Files stored in secure directory

✅ **Environment Variables**
- Sensitive configuration in `.env` file
- Never commit `.env` to version control

### Security Best Practices

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` for production
2. **Use HTTPS**: Deploy with HTTPS in production
3. **Database Security**: 
   - Use strong MongoDB credentials
   - Enable authentication on MongoDB
   - Use connection whitelisting if using MongoDB Atlas
4. **Environment Protection**: Keep `.env` file confidential

---

## Development Workflow

### Available Scripts

#### Backend

```bash
npm start          # Run production server
npm run dev        # Run with Nodemon (auto-reload on file changes)
npm test           # Run unit tests (if available)
```

#### Frontend

```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run code linter (oxlint)
```

### Testing

Unit tests for the scanning algorithm are available in:
- `backend/utils/scannerEngine.test.js`

Run tests:
```bash
cd backend
npm test
```

---

## Common Issues & Troubleshooting

### Issue: MongoDB Connection Error
**Error**: `MongoDB connection error: connect ECONNREFUSED`

**Solution**:
1. Ensure MongoDB is running: `mongod`
2. Verify connection string in `.env`
3. Check if MongoDB port (27017) is accessible

### Issue: CORS Error on Frontend
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Verify backend server is running on `http://localhost:5000`
2. Check CORS configuration in `backend/server.js`
3. Ensure frontend URL is in CORS whitelist

### Issue: Large File Upload Fails
**Error**: `File too large` or `413 Payload Too Large`

**Solution**:
1. Reduce file size below 5 MB limit
2. Or increase `MAX_FILE_SIZE` in `.env` and restart server

### Issue: Token Expired
**Error**: `Unauthorized: Token expired`

**Solution**:
1. Log out and log back in to refresh token
2. Adjust `JWT_EXPIRE` in `.env` if needed

### Issue: PDF Text Extraction Fails
**Cause**: Password-protected or image-based PDFs

**Solution**:
1. Remove PDF password protection
2. Convert image-based PDFs to text-searchable format
3. Use alternative file format (DOCX or TXT)

---

## Future Enhancements

### Planned Features

🚀 **Advanced Analysis**
- Machine learning-based skill gap analysis
- Personalized improvement roadmaps
- Competitive resume benchmarking

🚀 **Enhanced UI/UX**
- Dark mode support
- Resume preview alongside scan results
- Real-time keyword highlighting

🚀 **Admin Dashboard**
- User activity analytics
- Scan statistics and trends
- Usage reports and insights

🚀 **Additional Features**
- Multi-language support
- Resume template recommendations
- Integration with LinkedIn profiles
- Batch scan processing
- Email notifications for scan results

🚀 **Performance Improvements**
- Caching for frequently scanned terms
- Database query optimization
- CDN for static assets

---

## Contributing

We welcome contributions! To contribute:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/YourFeature`
3. **Make changes** and test thoroughly
4. **Commit changes**: `git commit -m 'Add YourFeature'`
5. **Push to branch**: `git push origin feature/YourFeature`
6. **Open a Pull Request** with detailed description

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and reusable

---

## Performance Optimization Tips

### For Development

- Use `npm run dev` in backend for Nodemon auto-reload
- Leverage browser DevTools for frontend debugging
- Use MongoDB Compass for database visualization

### For Production

- Enable Vite build optimization: `npm run build`
- Use production-grade MongoDB hosting (MongoDB Atlas)
- Deploy backend on platforms like Heroku, AWS, or DigitalOcean
- Enable caching headers for static assets
- Use environment-specific configuration

---

## License

This project is provided for educational and development purposes.

---

## Project Information

### Academic Details
- **Project Name**: Resume Scanner / CVScout
- **Semester**: TBD
- **Institution**: TBD
- **Guide**: TBD

### Group Members
- Member 1: Name
- Member 2: Name
- Member 3: Name
- Member 4: Name

---

## Support & Contact

For questions, issues, or suggestions:
- Open an **Issue** in the repository
- Create a **Discussion** thread
- Contact the project maintainers

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Basic user authentication (Register/Login)
- ✅ Resume upload and file parsing (PDF, DOCX, TXT)
- ✅ Resume-to-JD keyword matching
- ✅ Match score calculation
- ✅ Scan history tracking
- ✅ Basic suggestion generation

---

**Last Updated**: August 16, 2026

**Project Status**: Active Development 🚀

---
