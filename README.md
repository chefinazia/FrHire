# 🚀 FrHire - Modern Job Application Platform

A comprehensive job application platform built with React that connects students and recruiters through real-time notifications and streamlined application management.

## ✨ Features

### 👨‍🎓 **Student Features**
- **Job Discovery**: Browse available job postings with detailed descriptions
- **One-Click Applications**: Apply to jobs instantly with automatic notifications
- **Application Tracking**: Monitor application status in real-time
- **Review System**: View detailed feedback and ratings from recruiters
- **Real-time Notifications**: Get instant updates when recruiters take action

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

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router v6 with protected routes
- **Real-time Communication**: WebSocket with Node.js server
- **State Management**: React Context API
- **Type Safety**: PropTypes validation
- **Development Tools**: ESLint, Hot Module Replacement

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the WebSocket server**
   ```bash
   npm run ws
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173` or
   - Navigate to `http://localhost:3000`
   - Open a second tab/window to test real-time notifications

## 🧪 Test Accounts

### Student Accounts
| Email | Password | Name |
|-------|----------|------|
| `john@student.com` | `password` | John Smith |
| `jane@student.com` | `password` | Jane Doe |
| `mike@student.com` | `password` | Mike Johnson |

### Recruiter Account
| Email | Password | Role |
|-------|----------|------|
| `admin@company.com` | `password` | Recruiter |

## 📱 How to Test Real-time Notifications

1. **Open two browser windows/tabs**
2. **Login as recruiter** in one window (`admin@company.com`)
3. **Login as student** in another window (e.g., `john@student.com`)
4. **Test the workflow**:
   - Student applies to a job → Recruiter gets notification
   - Recruiter reviews application → Student gets notification
   - Recruiter adds notes → Student gets notification
   - Watch notifications update instantly across tabs!

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── NotificationBell.jsx    # Real-time notification dropdown
│   ├── RecruiterDashboard.jsx  # Main recruiter interface
│   ├── StudentDashboard.jsx    # Main student interface
│   └── ...
├── context/             # React Context providers
│   ├── AuthContext.jsx         # Authentication state
│   ├── ApplicationContext.jsx  # Application data management
│   └── NotificationContext.jsx # Real-time notifications
├── pages/               # Page components for routing
│   ├── QuickView.jsx           # Quick application review
│   ├── ReviewApplication.jsx   # Detailed review interface
│   └── ViewReview.jsx          # Student review viewing
├── login/               # Authentication components
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

- [ ] File upload for resumes and cover letters
- [ ] Email notifications integration
- [ ] Advanced search and filtering
- [ ] Interview scheduling system
- [ ] Analytics dashboard for recruiters
- [ ] Mobile app development

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
