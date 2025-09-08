# YONE Learning Platform

A comprehensive learning platform built with React Native, Node.js, and MongoDB. This app provides courses, video podcasts, roadmaps, articles, and career advice for developers.

## Features

### Frontend (React Native)
- **Netflix-style Loading Screen** - Animated splash screen with smooth transitions
- **Authentication System** - Login and registration with form validation
- **Bottom Tab Navigation** with 8 main sections:
  - **Home** - Dashboard with featured courses and quick actions
  - **Podcasts** - Video podcasts from industry experts
  - **Roadmaps** - Structured learning paths (no level classification as per user preference)
  - **Articles** - Latest insights and tutorials
  - **Advices** - Career tips and professional guidance
  - **Programming Terms** - Searchable dictionary of coding terms
  - **Top CV** - Professional CV templates (free as per user preference)
  - **More** - Additional features and settings
- **Profile Management** - User profile with logout functionality
- **Dashboard** - Learning analytics and progress tracking
- **Dark Theme** - Modern Netflix-inspired UI design
- **English Interface** - All content in English as per user preference

### Backend (Node.js + MongoDB)
- **RESTful API** with Express.js
- **JWT Authentication** with secure token management
- **User Management** - Registration, login, profile updates
- **Course System** - Create, read, update, delete courses
- **Database Models** - User, Course, and extensible schema
- **Security Features** - Password hashing, input validation, CORS
- **Error Handling** - Comprehensive error management

## Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- Expo Router for navigation
- Linear Gradient for UI effects
- React Native Reanimated for animations

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Expo CLI
- iOS Simulator or Android Emulator

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Run on device/simulator:**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp config.env.example .env
```

4. **Update .env file:**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yoneapp
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:8081
```

5. **Start the backend server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Project Structure

```
yoneapp/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── podcasts.tsx   # Video podcasts
│   │   ├── roadmaps.tsx   # Learning roadmaps
│   │   ├── articles.tsx   # Articles and tutorials
│   │   ├── advices.tsx    # Career advice
│   │   ├── programming-terms.tsx # Programming dictionary
│   │   ├── top-cv.tsx     # CV templates
│   │   └── more.tsx       # Additional features
│   ├── loading.tsx        # Netflix-style loading screen
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   ├── profile.tsx        # User profile
│   ├── dashboard.tsx      # User dashboard
│   └── _layout.tsx        # Root layout
├── backend/               # Node.js backend
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
├── components/           # Reusable components
├── constants/           # App constants
└── assets/             # Images, fonts, etc.
```

## Key Features Implementation

### 1. Netflix-Style Loading Screen
- Smooth animations with React Native Reanimated
- Gradient background with YONE branding
- Automatic navigation to login after animation

### 2. Authentication Flow
- Form validation with error handling
- Secure password requirements
- JWT token management
- Automatic navigation between screens

### 3. Bottom Tab Navigation
- 8 main tabs with appropriate icons
- More tab with sub-navigation to Profile and Dashboard
- Consistent dark theme throughout

### 4. User Preferences Implementation
- **12-hour time format** preference
- **No level classification** in roadmaps (Beginner/Intermediate/Advanced removed)
- **English interface** throughout
- **No prices displayed** for courses
- **Video podcasts** instead of audio

### 5. Backend API
- RESTful endpoints for all features
- Secure authentication with JWT
- Comprehensive error handling
- Input validation and sanitization

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/dashboard` - Get dashboard data

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses/:id/enroll` - Enroll in course

## Development

### Adding New Features
1. Create new screens in the `app/` directory
2. Add routes to the appropriate layout files
3. Create backend endpoints in `backend/routes/`
4. Update database models if needed

### Styling Guidelines
- Use LinearGradient for backgrounds
- Maintain Netflix-inspired dark theme
- Use consistent color scheme (#E50914 for accents)
- Follow the established component patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

MIT License

## Support

For support and questions, please open an issue in the repository.

---

**Note**: This project follows the user's preferences for English interface, 12-hour time format, no level classification in roadmaps, no course prices, and video podcasts over audio content.