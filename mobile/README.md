# MICE Hotels Mobile App

A React Native mobile application (iOS & Android) for the MICE Hotels Event Management Platform.

## 🎯 Features

- **Authentication**: Login and registration with JWT
- **Hotel Browsing**: View available hotels and their event spaces
- **Hall Details**: Explore conference halls, capacities, and pricing
- **Booking Management**: View and track your event bookings
- **Real-time Updates**: Synchronized with backend API
- **Cross-Platform**: Single codebase for iOS and Android

## 🏗️ Technology Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation library
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence

## 📋 Prerequisites

- Node.js 18+ LTS
- npm or yarn
- Expo CLI (installed automatically)
- For iOS: macOS with Xcode (for simulator) or Expo Go app
- For Android: Android Studio (for emulator) or Expo Go app

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Backend URL

By default, the app connects to `http://localhost:3000/api`. To change this:

Edit `src/utils/constants.ts`:
```typescript
export const API_URL = 'http://YOUR_BACKEND_URL/api';
```

**Important for physical devices**: Use your computer's local IP address instead of `localhost`:
```typescript
// Example:
export const API_URL = 'http://192.168.1.100:3000/api';
```

### 3. Start Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### 4. Run on Device/Emulator

#### Option A: Using Expo Go (Easiest)

1. Install Expo Go app on your device:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from the terminal with:
   - iOS: Camera app
   - Android: Expo Go app

#### Option B: Using Simulators/Emulators

**iOS Simulator (macOS only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

#### Option C: Web Browser (for testing)
```bash
npm run web
```

## 📱 App Structure

```
mobile/
├── src/
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── HotelsScreen.tsx
│   │   ├── HotelDetailScreen.tsx
│   │   └── MyBookingsScreen.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── index.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   └── utils/           # Utilities and constants
│       └── constants.ts
├── App.tsx              # Root component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## 🔧 Development

### Running with Backend

1. **Start the backend server** (in the main project directory):
   ```bash
   docker-compose up
   ```

2. **Find your local IP address**:
   - macOS/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

3. **Update API_URL** in `src/utils/constants.ts` with your IP

4. **Start the mobile app**:
   ```bash
   cd mobile
   npm start
   ```

### Test Credentials

Use these credentials to login (after running backend seed):
- **Email**: client@example.com
- **Password**: password123

## 📦 Building for Production

### iOS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android Build

```bash
# Build APK for Android
eas build --platform android --profile preview

# Or build AAB for Google Play
eas build --platform android
```

## 🎨 Customization

### Colors and Styling

Edit `src/utils/constants.ts`:
```typescript
export const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  // ... customize your colors
};
```

### App Name and Icon

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "icon": "./assets/icon.png"
  }
}
```

## 🐛 Troubleshooting

### Cannot connect to backend

1. Make sure backend is running: `docker-compose up`
2. Check if you're using the correct IP address (not `localhost` on physical devices)
3. Ensure your phone and computer are on the same WiFi network
4. Check firewall settings

### Metro bundler issues

```bash
# Clear cache and restart
npm start -- --clear
```

### Dependencies issues

```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📖 API Integration

The app integrates with the MICE Hotels backend API:

- **Base URL**: Configurable in `src/utils/constants.ts`
- **Authentication**: JWT tokens stored in AsyncStorage
- **Endpoints**: Defined in `src/services/api.ts`

### Available API Modules

- `authAPI`: Login, register, get current user
- `hotelsAPI`: Get hotels, halls, catering, services
- `bookingsAPI`: Create, list, update bookings

## 🚢 Deployment

### Expo Application Services (EAS)

1. **Create an Expo account** at https://expo.dev
2. **Install EAS CLI**: `npm install -g eas-cli`
3. **Login**: `eas login`
4. **Build**: `eas build --platform all`
5. **Submit**: `eas submit --platform all`

### Alternative: React Native CLI

For full control, you can eject from Expo:
```bash
npx expo prebuild
```

Then use standard React Native build commands.

## 📝 Future Enhancements

- [ ] Booking wizard (5-step flow)
- [ ] PDF preview of proposals
- [ ] Push notifications
- [ ] Calendar integration
- [ ] Offline mode
- [ ] Image galleries for hotels
- [ ] Maps integration
- [ ] Multi-language support

## 🔒 Security Notes

- JWT tokens are stored securely in AsyncStorage
- API calls are authenticated via Bearer tokens
- Passwords are never stored locally
- All API communication should use HTTPS in production

## 📄 License

MIT

## 📧 Support

For support, please open an issue in the repository.

---

**Built with ❤️ for the hospitality industry**
