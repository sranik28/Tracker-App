# Admin Dashboard - Employee Location Tracker

A real-time web dashboard for monitoring employee locations with live tracking updates.

## 🚀 Features

- **Real-time Map View**: Interactive map showing all employee locations
- **Live Updates**: Socket.IO integration for instant location updates
- **Employee Management**: View all employees with status indicators
- **Statistics Dashboard**: Track total, active, and offline employees
- **Search & Filter**: Find employees quickly by name, email, or ID
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful dark theme with glassmorphism effects

## 📋 Prerequisites

- Backend server running on `http://192.168.20.73:5000`
- Admin user account
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Setup

### 1. Start the Backend Server

Make sure the backend server is running:

```bash
cd employee-tracking-backend
npm run dev
```

### 2. Open the Dashboard

Simply open `login.html` in your web browser:

```bash
cd employee-tracking-dashboard
# Open login.html in your browser
```

Or use a local server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080
```

Then navigate to: `http://localhost:8080/login.html`

## 🔐 Login

### Demo Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`

> **Note**: You need to create an admin user in the database first. Use the backend API or create one manually.

### Creating an Admin User

You can register as an admin by modifying the registration endpoint or directly in the database:

```javascript
// In MongoDB
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2b$12$...", // Hashed password for "admin123"
  role: "ADMIN",
  isActive: true,
  employeeId: "ADMIN001"
})
```

## 📱 Usage

### Dashboard Overview

1. **Statistics Cards**: View total employees, tracking count, and offline count
2. **Employee List**: Browse all employees with real-time status
3. **Map View**: See employee locations on an interactive map
4. **Filters**: Filter by All, Tracking, or Offline
5. **Search**: Search employees by name, email, or ID

### Real-time Features

- **Location Updates**: Employee locations update automatically on the map
- **Session Updates**: Status changes (ON/OFF) reflect instantly
- **Connection Status**: See if you're connected to the real-time server

### Map Controls

- **Center Button**: Auto-center map on all employees
- **Refresh Button**: Reload employee data
- **Click Marker**: View employee details in popup
- **Click Employee**: Center map on that employee's location

## 🎨 UI Components

### Statistics Cards

- **Total Employees**: Count of all employees
- **Currently Tracking**: Employees with active tracking
- **Offline**: Employees not currently tracking
- **Today's Sessions**: Total sessions today (future feature)

### Employee List

Each employee card shows:
- Status indicator (🟢 tracking / 🔴 offline)
- Employee name
- Employee ID
- Current status
- Last update time

### Map Markers

- **Green Marker**: Employee is tracking
- **Red Marker**: Employee is offline
- **Click Marker**: View employee details

## 🔧 Configuration

### API Endpoint

Update the API base URL in `js/auth.js`:

```javascript
const API_BASE_URL = 'http://192.168.20.73:5000/api/v1';
```

### Socket.IO Connection

Update the Socket.IO URL in `js/socket.js`:

```javascript
this.socket = io('http://192.168.20.73:5000/admin', {
    auth: { token },
});
```

## 📂 Project Structure

```
employee-tracking-dashboard/
├── index.html          # Main dashboard page
├── login.html          # Admin login page
├── css/
│   └── style.css       # Dashboard styles
├── js/
│   ├── auth.js         # Authentication & API client
│   ├── dashboard.js    # Main dashboard logic
│   ├── map.js          # Map handling (Leaflet.js)
│   └── socket.js       # Socket.IO connection
└── README.md           # This file
```

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🐛 Troubleshooting

### Cannot Connect to Server

- Ensure backend server is running
- Check if IP address is correct
- Verify firewall settings allow connections

### Map Not Loading

- Check internet connection (map tiles load from OpenStreetMap)
- Verify Leaflet.js CDN is accessible

### Real-time Updates Not Working

- Check Socket.IO connection status (top right)
- Verify admin token is valid
- Check browser console for errors

### No Employees Showing

- Ensure employees exist in the database
- Check if API endpoint is correct
- Verify admin authentication

## 🔒 Security Notes

- Always use HTTPS in production
- Store tokens securely
- Implement proper CORS policies
- Use environment variables for sensitive data

## 📝 Future Enhancements

- [ ] Employee tracking history view
- [ ] Date range reports
- [ ] Export data to CSV/PDF
- [ ] Geofencing alerts
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

## 🤝 Support

For issues or questions, please check the backend server logs and browser console for errors.

---

**Built with ❤️ for real-time employee tracking**
