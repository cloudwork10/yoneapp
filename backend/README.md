# YONE Learning Platform - Backend API

This is the backend API for the YONE Learning Platform built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, logout)
- User profile management
- Course management
- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- Error handling
- CORS support
- Security middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp config.env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yoneapp
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:8081
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/dashboard` - Get dashboard data

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course (Instructor/Admin)
- `DELETE /api/courses/:id` - Delete course (Instructor/Admin)

### Health Check
- `GET /api/health` - API health check

## Database Models

### User
- Personal information (name, email, password)
- Role-based access (student, instructor, admin)
- Learning statistics
- Course enrollments and completions
- Preferences and settings

### Course
- Course details (title, description, category, level)
- Instructor information
- Video content and resources
- Student enrollments and completions
- Ratings and reviews

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Success Responses

```json
{
  "status": "success",
  "message": "Success message",
  "data": {} // Response data
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Helmet for security headers
- Rate limiting (can be added)

## Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Features

1. Create model in `models/` directory
2. Create routes in `routes/` directory
3. Add middleware if needed in `middleware/` directory
4. Update server.js to include new routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
