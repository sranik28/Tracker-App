# Employee Tracker Mobile App

Production-ready React Native mobile app for employee location tracking with battery optimization.

## Features

- ✅ Secure JWT authentication with auto token refresh
- ✅ Foreground & background location tracking
- ✅ Battery-optimized adaptive intervals
- ✅ Location batching (80% network reduction)
- ✅ Offline support with queue system
- ✅ Clean, intuitive UI

## Tech Stack

- React Native (Expo)
- TypeScript
- Zustand (state management)
- Axios (HTTP client)
- Expo Location + TaskManager
- Expo SecureStore

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Run on iOS**
   ```bash
   npm run ios
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── services/         # API and location services
├── store/            # Zustand state management
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
├── utils/            # Helper functions
└── config/           # App configuration
```

## Battery Optimization

- **Adaptive Intervals**: Adjusts based on movement and battery level
- **Distance Filtering**: Only tracks significant movement (>10m)
- **Batch Uploads**: Sends locations in batches every 5 min or 10 locations
- **Low Battery Mode**: Reduces tracking frequency when battery < 20%

## Permissions

The app requires:
- Location (foreground & background)
- Battery status

## Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## License

MIT
