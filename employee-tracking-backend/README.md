# Employee Location Tracking Backend

A production-ready, high-performance backend system for employee location tracking built with Node.js, Express, MongoDB, and Socket.IO.

## 🚀 Features

- **Battery-Optimized Location Tracking**: Intelligent filtering to minimize battery drain
- **Real-time Location Streaming**: Socket.IO for live admin dashboard updates
- **JWT Authentication**: Secure access and refresh token implementation
- **Role-Based Access Control**: Admin and Employee roles with granular permissions
- **Working Hours Calculation**: Timezone-aware daily and range reports
- **Batch Location Upload**: Reduce network calls by up to 80%
- **Auto-OFF Mechanism**: Automatic session termination for inactive employees
- **Rate Limiting**: Protection against abuse
- **Comprehensive Validation**: Zod-based request validation
- **Production-Ready**: Error handling, logging, compression, and security headers

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (optional, for caching and socket scaling)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
cd employee-tracking-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use your local MongoDB installation
mongod
```

5. **Start Redis (optional)**
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "employee@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "employee@example.com",
      "role": "EMPLOYEE"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Employee Management (Admin Only)

#### Create Employee
```http
POST /api/v1/employees
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "employeeId": "EMP001"
}
```

#### Get All Employees
```http
GET /api/v1/employees?isActive=true
Authorization: Bearer {accessToken}
```

#### Update Employee Status
```http
PATCH /api/v1/employees/{id}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "isActive": false
}
```

### Location Tracking (Employee Only)

#### Start Tracking Session
```http
POST /api/v1/location/on
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

#### Submit Location
```http
POST /api/v1/location/track
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "accuracy": 10,
  "batteryLevel": 85,
  "timestamp": "2024-01-20T10:30:00Z"
}
```

#### Batch Location Upload
```http
POST /api/v1/location/batch
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "locations": [
    {
      "latitude": 23.8103,
      "longitude": 90.4125,
      "accuracy": 10,
      "batteryLevel": 85,
      "timestamp": "2024-01-20T10:30:00Z"
    },
    {
      "latitude": 23.8104,
      "longitude": 90.4126,
      "accuracy": 12,
      "batteryLevel": 84,
      "timestamp": "2024-01-20T10:31:00Z"
    }
  ]
}
```

#### Stop Tracking Session
```http
POST /api/v1/location/off
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "latitude": 23.8105,
  "longitude": 90.4127
}
```

### Reports (Admin Only)

#### Get Daily Report
```http
GET /api/v1/reports/daily/{employeeId}?date=2024-01-20
Authorization: Bearer {accessToken}
```

#### Get Date Range Report
```http
GET /api/v1/reports/range/{employeeId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {accessToken}
```

## 🔌 Socket.IO Integration

### Admin Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000/admin', {
  auth: {
    token: 'your-admin-access-token'
  }
});

// Listen for location updates
socket.on('location:update', (data) => {
  console.log('Location update:', data);
  // {
  //   employeeId: "...",
  //   employeeName: "John Doe",
  //   latitude: 23.8103,
  //   longitude: 90.4125,
  //   accuracy: 10,
  //   batteryLevel: 85,
  //   timestamp: "2024-01-20T10:30:00Z"
  // }
});

// Listen for session updates
socket.on('session:update', (data) => {
  console.log('Session update:', data);
  // {
  //   employeeId: "...",
  //   employeeName: "John Doe",
  //   status: "ON",
  //   timestamp: "2024-01-20T10:30:00Z"
  // }
});
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/employee-tracking` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | - |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `JWT_ACCESS_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |
| `LOCATION_DISTANCE_THRESHOLD` | Min distance to save (meters) | `10` |
| `LOCATION_TIME_THRESHOLD` | Min time to save (seconds) | `30` |
| `AUTO_OFF_TIMEOUT` | Auto-OFF timeout (seconds) | `3600` |
| `TIMEZONE` | Application timezone | `Asia/Dhaka` |

### Battery Optimization Strategy

The system implements intelligent location filtering to minimize battery drain:

1. **Distance Threshold**: Only save locations if moved > 10 meters
2. **Time Threshold**: Only save if > 30 seconds since last update
3. **Batch Processing**: Accept up to 50 locations per request
4. **Duplicate Detection**: Ignore identical coordinates

### Client-Side Recommendations

```javascript
// Adaptive location update intervals
const intervals = {
  stationary: 5 * 60 * 1000,  // 5 minutes
  moving: 60 * 1000,          // 1 minute
  highSpeed: 30 * 1000        // 30 seconds
};

// Batch queue
let locationQueue = [];

function queueLocation(location) {
  locationQueue.push(location);
  
  // Upload every 5 minutes or 10 locations
  if (locationQueue.length >= 10) {
    uploadBatch();
  }
}

async function uploadBatch() {
  if (locationQueue.length === 0) return;
  
  await fetch('/api/v1/location/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locations: locationQueue })
  });
  
  locationQueue = [];
}
```

## 🏗️ Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (Employee)     │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐      ┌──────────────┐
│  Express.js     │◄─────┤  Socket.IO   │
│  API Server     │      │  (Real-time) │
└────────┬────────┘      └──────┬───────┘
         │                      │
         │                      │
┌────────▼────────┐      ┌──────▼───────┐
│   MongoDB       │      │    Redis     │
│  (Primary DB)   │      │   (Cache)    │
└─────────────────┘      └──────────────┘
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── models/          # Mongoose schemas
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── validators/      # Zod validation schemas
├── routes/          # API routes
├── sockets/         # Socket.IO handlers
├── utils/           # Utility functions
├── types/           # TypeScript types
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable origins
- **Rate Limiting**: 100 requests per 15 minutes
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 rounds
- **Input Validation**: Zod schema validation
- **Role-Based Access**: Admin/Employee separation

## 📊 Database Indexes

Optimized indexes for high-performance queries:

- **User**: `email`, `employeeId`, `role`
- **LocationLog**: `employeeId + timestamp`, `sessionId`
- **ActivitySession**: `employeeId + startTime`, `status`
- **DailyWorkSummary**: `employeeId + date` (unique)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📝 License

MIT

## 👥 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ for production-grade employee tracking**
