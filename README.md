# CodeQuest: Coding Challenge Platform

CodeQuest is a full-stack web application that allows users to solve coding challenges, test their solutions against predefined test cases, and track their progress. The platform supports multiple programming languages including JavaScript, Python, Java, and C++.

## Features

- **Code Execution**: Secure execution of user code against predefined test cases
- **Multiple Languages**: Support for JavaScript, Python, Java, and C++
- **User Dashboard**: Track solved problems, submissions, and progress
- **Leaderboards**: Compete with other users based on problems solved
- **Profile Page**: View user statistics, badges, and streaks
- **Admin Panel**: Create and manage coding problems and test cases

## Technology Stack

### Backend
- **Node.js** + **Express.js**: Server framework
- **MongoDB** + **Mongoose**: Database and ODM
- **VM2**: Secure sandbox for JavaScript code execution
- **Child Process**: Execute code in Python and other languages
- **JWT**: Authentication and authorization

### Frontend (Planned)
- **React.js**: Frontend library
- **Redux**: State management
- **Monaco Editor**: Code editor component
- **Chart.js**: Visualize user statistics
- **Material UI**: UI components

## Project Structure

```
├── server/              # Backend code
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── temp/            # Temporary directory for code execution
│   └── index.js         # Server entry point
├── client/              # Frontend code (to be added)
└── README.md            # Project documentation
```

## Key Components

### Code Executor

The core of the platform is the `CodeExecutor` class that:
- Executes user-submitted code securely using VM2 (for JavaScript) or child processes (for Python, etc.)
- Compares the output with expected results
- Handles timeouts and errors
- Supports different data types and structures for inputs and outputs

### Problem Management

Problems include:
- Description, constraints, and examples
- Difficulty level and tags
- Test cases (both visible and hidden)
- Starter code in multiple languages
- Time and memory limits

### User Progress Tracking

The platform tracks:
- Problems solved by each user
- Daily submission streaks
- Programming language preferences
- Submission statistics

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- Python (for Python code execution)

### Backend Setup
1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file based on `.env.example`
5. Run the server: `npm run dev`

### API Endpoints

#### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/me`: Get current user profile
- `PUT /api/auth/me`: Update user profile
- `PUT /api/auth/password`: Change password

#### Problems
- `GET /api/problems`: Get all problems
- `GET /api/problems/:id`: Get a problem by ID
- `POST /api/problems`: Create a new problem (admin only)
- `PUT /api/problems/:id`: Update a problem (admin only)
- `DELETE /api/problems/:id`: Delete a problem (admin only)
- `GET /api/problems/:id/stats`: Get problem statistics

#### Submissions
- `POST /api/submissions`: Create a new submission
- `GET /api/submissions/:id`: Get a submission by ID
- `GET /api/submissions/user/me`: Get current user's submissions
- `GET /api/submissions/user/:userId`: Get user's submissions (admin only)
- `GET /api/submissions/problem/:problemId`: Get problem submissions (admin only)

#### Users
- `GET /api/users/leaderboard`: Get user leaderboard
- `GET /api/users/streaks`: Get top streaks
- `GET /api/users/:username`: Get user profile by username

## Future Enhancements

- Real-time collaboration
- Code sharing
- Custom test cases
- Contests and timed challenges
- Code review and mentorship

## License

MIT
