
# 🚀 FrHire - AI-Powered Job Application Platform

A comprehensive job application platform built with React that connects students and recruiters through real-time notifications, AI-powered resume analysis, and streamlined application management.

## ✨ Features

### 👨‍🎓 **Student Features**
- **Job Discovery**: Browse available job postings with detailed descriptions
- **One-Click Applications**: Apply to jobs instantly with automatic notifications
- **Application Tracking**: Monitor application status in real-time
- **Review System**: View detailed feedback and ratings from recruiters
- **Real-time Notifications**: Get instant updates when recruiters take action
- **🆕 AI Resume Analysis**: Upload resume for ATS compatibility analysis
- **🆕 Smart Resume Builder**: AI-powered resume optimization with real-time feedback
- **🆕 PDF Export**: Generate professional, ATS-friendly resume PDFs
- **🆕 Coin Rewards System**: Earn coins for resume uploads and improvements
- **🆕 ATS Optimization Tips**: Get personalized guidance for better resume performance
- **🆕 Database Persistence**: Resume data automatically saved and restored
- **🆕 Auto-save Functionality**: Draft saves while editing, completed saves on submit
- **🆕 Enhanced AI Parser**: Advanced resume parsing with multiple pattern matching

### 👔 **Recruiter Features**
- **Application Management**: Comprehensive dashboard to manage all applications
- **Quick View**: Rapid application assessment with status updates
- **Detailed Reviews**: Provide ratings, feedback, and detailed evaluations
- **Notes System**: Add private notes that automatically notify students
- **Real-time Updates**: Instant notifications for new applications

### 🔔 **Real-time Notification System**
- **WebSocket Integration**: Instant notifications across all open tabs
- **Scrollable Interface**: Clean, organized notification dropdown
- **Cross-tab Sync**: Notifications sync across multiple browser tabs
- **Auto-reconnect**: Robust WebSocket connection with automatic reconnection

### 🤖 **AI-Powered Resume Analysis**
- **ATS Compatibility Scoring**: Get detailed analysis of resume ATS-friendliness
- **Keyword Detection**: Identify missing industry-relevant keywords
- **Structure Analysis**: Evaluate resume format and organization
- **Improvement Suggestions**: Receive specific recommendations for optimization
- **Real-time Validation**: Instant feedback on form inputs for ATS compliance

### 📄 **Smart Resume Builder**
- **Auto-Population**: Automatically extract and fill resume data from uploads
- **ATS-Friendly Forms**: Optimized input fields with validation
- **Live Preview**: Real-time resume preview as you edit
- **Professional Templates**: Clean, ATS-compatible resume layouts
- **Export Options**: Generate PDF resumes with professional formatting

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router v6 with protected routes
- **Real-time Communication**: WebSocket with Node.js server
- **State Management**: React Context API
- **Type Safety**: PropTypes validation
- **Development Tools**: ESLint, Hot Module Replacement
- **🆕 PDF Generation**: jsPDF for resume export functionality
- **🆕 File Processing**: HTML5 File API for resume uploads
- **🆕 AI Analysis**: Custom ATS scoring algorithms
- **🆕 Database System**: JSON-based localStorage with CRUD operations
- **🆕 PDF Parsing**: pdf-parse library for text extraction
- **🆕 Data Persistence**: Automatic save/load with user isolation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/FrHire.git
   cd FrHire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional dependencies for resume features**
   ```bash
   npm install jspdf pdf-parse
   ```

4. **Start the WebSocket server**
   ```bash
   npm run ws
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Open a second tab/window to test real-time notifications

## 🧪 Test Accounts

### Student Accounts
| Email | Password | Name | Coins |
|-------|----------|------|-------|
| `john@student.com` | `password` | John Smith | 100 |
| `jane@student.com` | `password` | Jane Doe | 100 |
| `mike@student.com` | `password` | Mike Johnson | 100 |
| `rachitarora1993@gmail.com` | `password` | Rachit Arora | 100 |

### Recruiter Account
| Email | Password | Role |
|-------|----------|------|
| `admin@company.com` | `password` | Recruiter |

## 📱 How to Test Features

### Real-time Notifications
1. **Open two browser windows/tabs**
2. **Login as recruiter** in one window (`admin@company.com`)
3. **Login as student** in another window (e.g., `john@student.com`)
4. **Test the workflow**:
   - Student applies to a job → Recruiter gets notification
   - Recruiter reviews application → Student gets notification
   - Recruiter adds notes → Student gets notification
   - Watch notifications update instantly across tabs!

### AI Resume Analysis & Smart Builder
1. **Login as student** (`rachitarora1993@gmail.com`)
2. **Navigate to "Resume & ATS Analysis" tab**
3. **Upload a resume file** (PDF supported)
4. **View ATS analysis results** with scoring and recommendations
5. **Use Smart Resume Builder** to optimize your resume:
   - Review auto-populated data from enhanced AI parser
   - Edit fields with ATS-friendly guidance and real-time validation
   - Auto-save functionality saves drafts while editing
   - Click "Save & Continue" to save as completed
   - Export professional PDF resume
6. **Earn coins** for resume uploads and improvements
7. **Data persistence**: Resume data is automatically saved and restored
8. **Edit improvements**: Click "Edit Improvements" to modify saved resume

## 📄 Resume Features Deep Dive

### AI-Powered ATS Analysis
- **Compatibility Scoring**: Get a percentage score (0-100%) for ATS compatibility
- **Keyword Detection**: Identifies missing industry-relevant keywords
- **Structure Analysis**: Evaluates resume format and organization
- **Section Recognition**: Detects standard resume sections (Experience, Education, Skills)
- **Action Verb Analysis**: Identifies strong action verbs in descriptions
- **Metrics Detection**: Finds quantifiable achievements and numbers

### Smart Resume Builder
- **Enhanced AI Parser**: Advanced pattern matching for accurate data extraction
- **Auto-Population**: Automatically extracts data from uploaded resumes
- **Real-time Validation**: Instant feedback on ATS-friendly formatting
- **Professional Guidance**: Tips and suggestions for each field
- **Error Prevention**: Validates email formats, phone numbers, and content
- **Live Preview**: See changes as you type
- **Responsive Design**: Works on all device sizes
- **Auto-save**: Automatically saves drafts while editing
- **Manual Save**: "Save & Continue" saves as completed
- **Data Persistence**: Resume data survives browser refresh

### PDF Export System
- **Clean Output**: Professional, ATS-friendly resume format
- **Small File Size**: Optimized PDFs (typically under 1MB)
- **Print-Ready**: Proper margins and formatting for A4 paper
- **Text-Based**: No images or heavy elements for better ATS parsing
- **Professional Typography**: Clean fonts and consistent styling

### Coin Rewards System
- **Resume Upload**: Earn 50 coins for uploading a resume
- **Improvement Actions**: Additional coins for making optimizations
- **Progress Tracking**: Visual coin counter in the dashboard
- **Gamification**: Encourages users to improve their resumes

### Database System
- **JSON-based Storage**: Uses localStorage for client-side persistence
- **User Isolation**: Each user's data is stored separately
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Status Tracking**: Draft vs completed resume states
- **Auto-save**: Automatic draft saving while editing
- **Data Recovery**: Resume data persists across browser sessions
- **Export/Import**: Backup and restore database functionality
- **Error Handling**: Robust error handling with user notifications

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── NotificationBell.jsx    # Real-time notification dropdown
│   ├── RecruiterDashboard.jsx  # Main recruiter interface
│   ├── StudentDashboard.jsx    # Main student interface
│   ├── ResumeUpload.jsx        # Resume upload with ATS analysis
│   ├── SmartResumeForm.jsx     # AI-powered resume builder
│   ├── ResumeBuilder.jsx       # Legacy resume builder
│   └── ...
├── utils/               # Utility functions
│   └── database.js             # Database operations and CRUD functions
├── context/             # React Context providers
│   ├── AuthContext.jsx         # Authentication state
│   ├── ApplicationContext.jsx  # Application data management
│   └── NotificationContext.jsx # Real-time notifications
├── pages/               # Page components for routing
│   ├── QuickView.jsx           # Quick application review
│   ├── ReviewApplication.jsx   # Detailed review interface
│   └── ViewReview.jsx          # Student review viewing
├── login/               # Authentication components
│   ├── Login.jsx               # Login with coin system
│   └── Signup.jsx              # User registration
└── ...
```

## ⚡ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run ws` | Start WebSocket server |

## 🔧 Configuration

### WebSocket Server
The WebSocket server runs on port `5178` by default. You can configure this in:
- `ws-server.cjs` - Server configuration
- `NotificationContext.jsx` - Client connection

### Environment Variables
Create a `.env` file for custom configuration:
```env
VITE_WS_PORT=5178
```

## 🎯 User Workflows

### Student Workflow
1. **Login** with student credentials
2. **Browse Jobs** in the "Job Listings" tab
3. **Apply** to jobs with one click
4. **Track Applications** in "My Applications" tab
5. **View Reviews** when recruiters provide feedback
6. **Get Notifications** for all recruiter actions
7. **🆕 Upload Resume** for ATS analysis and optimization
8. **🆕 Use Smart Builder** to improve resume with AI guidance
9. **🆕 Auto-save** drafts while editing (saved automatically)
10. **🆕 Save & Continue** to save as completed resume
11. **🆕 Export PDF** for professional job applications
12. **🆕 Earn Coins** for resume improvements and uploads
13. **🆕 Edit Improvements** to modify saved resume data

### Recruiter Workflow
1. **Login** with recruiter credentials
2. **View Applications** in the main dashboard
3. **Quick Review** for rapid status updates
4. **Detailed Review** with ratings and feedback
5. **Add Notes** that notify students instantly
6. **Track Progress** across all applications

## 🔒 Security Features

- **Protected Routes**: Role-based access control
- **Input Validation**: PropTypes validation throughout
- **Secure Authentication**: Session-based auth system
- **Data Isolation**: Students only see their own data

## 🚦 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy WebSocket Server
```bash
node ws-server.cjs
```

### Serve Static Files
Deploy the `dist/` folder to your preferred hosting platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Quality

- ✅ **ESLint configured** with React best practices
- ✅ **PropTypes validation** for all components
- ✅ **Error handling** throughout the application
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Clean architecture** with separation of concerns

## 🐛 Known Issues

- WebSocket connection may take a moment to establish on first load
- Notifications persist in localStorage (intentional for demo purposes)

## 🔮 Future Enhancements

- [x] ✅ File upload for resumes and cover letters
- [x] ✅ AI-powered resume analysis and ATS scoring
- [x] ✅ Smart resume builder with real-time validation
- [x] ✅ PDF export functionality
- [x] ✅ Coin rewards system
- [x] ✅ Database persistence with auto-save
- [x] ✅ Enhanced AI parser with multiple pattern matching
- [x] ✅ Resume data recovery and editing
- [ ] Email notifications integration
- [ ] Advanced search and filtering
- [ ] Interview scheduling system
- [ ] Analytics dashboard for recruiters
- [ ] Mobile app development
- [ ] Resume templates library
- [ ] Cover letter generator
- [ ] Job matching algorithm
- [ ] Cloud database integration
- [ ] Resume versioning system
- [ ] Advanced analytics for resume performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- WebSocket implementation for real-time features
- Tailwind CSS for beautiful, responsive design
- Vite for lightning-fast development experience

---

**Made with ❤️ for connecting talent with opportunity**

For questions or support, please open an issue in the GitHub repository.
