# BloodLink - Mobile Application

<div align="center">

![BloodLink Logo](https://img.shields.io/badge/BloodLink-Donation%20Platform-red)
![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue)
![Expo](https://img.shields.io/badge/Expo-54.0.13-lightgrey)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-brightgreen)

**A mobile platform connecting blood donors with recipients in need**

</div>

## 📱 Overview

BloodLink is a React Native mobile application designed to facilitate blood donation by connecting voluntary donors with patients and healthcare centers in urgent need of blood. The app provides real-time matching, location-based services, and secure communication between donors and recipients.

## ✨ Features

### 🔴 Core Functionality
- **Donor Registration**: Easy signup for blood donors with blood type and location
- **Blood Request System**: Patients/hospitals can create urgent blood requests
- **Smart Matching**: Automatic matching based on blood type compatibility and proximity
- **Real-time Notifications**: Instant alerts for matching donors
- **Emergency Requests**: Priority system for critical blood needs

### 🗺️ Location Services
- GPS-based donor and recipient location
- Nearby blood banks and hospitals
- Distance calculation for optimal matching

### 🔔 Notifications & Alerts
- Push notifications for blood requests
- Emergency alert system
- Donation reminder system
- Status updates for requests

### 👤 User Management
- Donor profiles with blood type and availability
- Recipient/hospital accounts
- Donation history tracking
- Rating and feedback system

## 🛠️ Tech Stack

### Frontend
- **React Native 0.81.4** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform and services
- **TypeScript** - Type safety and better development experience

### Navigation
- **React Navigation v6** - Stack and bottom tab navigation
- **React Native Screens** - Native screen components

### UI & Design
- **React Native Paper** - Material Design components
- **React Native Maps** - Interactive maps and location services
- **React Native Gesture Handler** - Touch and gesture handling

### Notifications
- **Expo Notifications** - Push notification system
- **Expo Linking** - Deep linking capabilities

### State Management
- **React Context API** / **Redux** (based on implementation)
- **AsyncStorage** for local data persistence

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/your-username/bloodlink-frontend.git
cd bloodlink-frontend
Install dependencies

bash
npm install
# or
yarn install
Start the development server

bash
npx expo start
# or
npm start
Run on device/emulator

Press a for Android emulator

Press i for iOS simulator

Scan QR code with Expo Go app (physical device)

📱 Build & Deployment
Development Build
bash
# Start development server
npx expo start
Production Build
Using EAS Build (Recommended)
bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
Local Build
bash
# Prebuild native files
npx expo prebuild

# Build Android APK
cd android && ./gradlew assembleRelease

# Build iOS (requires macOS)
cd ios && pod install
xcodebuild -workspace BloodLink.xcworkspace -scheme BloodLink -configuration Release
Export Bundle
bash
# Export for standalone deployment
npx expo export --platform android
npx expo export --platform ios
🏗️ Project Structure
text
bloodlink-frontend/
├── assets/                 # Static assets (images, fonts, icons)
├── android/                # Android native code (after prebuild)
├── ios/                    # iOS native code (after prebuild)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common components (Buttons, Inputs)
│   │   ├── donor/          # Donor-specific components
│   │   └── recipient/      # Recipient-specific components
│   ├── screens/            # App screens
│   │   ├── auth/           # Authentication screens
│   │   ├── donor/          # Donor dashboard and screens
│   │   ├── recipient/      # Recipient screens
│   │   └── common/         # Shared screens
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── DonorStack.js
│   │   └── RecipientStack.js
│   ├── services/           # API services and external integrations
│   │   ├── api.js          # API calls
│   │   ├── auth.js         # Authentication service
│   │   ├── notifications.js # Push notifications
│   │   └── location.js     # Location services
│   ├── context/            # React Context for state management
│   ├── utils/              # Helper functions and utilities
│   └── constants/          # App constants and configuration
├── App.js                  # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
⚙️ Configuration
Environment Setup
Create a .env file in the root directory:

env
EXPO_PUBLIC_API_URL=your_api_url_here
EXPO_PUBLIC_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_NOTIFICATION_KEY=your_notification_key
App Configuration (app.json)
json
{
  "expo": {
    "name": "BloodLink",
    "slug": "bloodlink",
    "version": "1.0.0",
    "platforms": ["android", "ios"],
    "android": {
      "package": "com.bloodlink.app",
      "permissions": ["ACCESS_FINE_LOCATION", "NOTIFICATIONS"]
    },
    "ios": {
      "bundleIdentifier": "com.bloodlink.app"
    }
  }
}
🔧 Development
Code Style
Use ES6+ JavaScript/TypeScript

Follow React Native best practices

Component naming: PascalCase

File naming: camelCase for JS, kebab-case for assets

