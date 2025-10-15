# React Native Chat App (Expo) – Starter Navigation

Minimal Expo React Native app scaffold for a chat project. Includes navigation and four placeholder screens; no backend or styling yet.

## Included
- React Navigation (native stack)
- Screens: Login, Signup, User List, Chat
- Button-based navigation between screens

## Prerequisites
- Node.js LTS
- Android/iOS emulator or a phone with Expo Go

## Install
```bash
npm install
```

## Run
```bash
npm start
```
Then:
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for Web

## Structure
```
.
├─ App.tsx
├─ index.ts
└─ src/
   ├─ navigation/
   │  └─ RootNavigator.tsx
   └─ screens/
      ├─ LoginScreen.tsx
      ├─ SignupScreen.tsx
      ├─ UserListScreen.tsx
      └─ ChatScreen.tsx
```

## Current flow
- Login → Signup / Users
- Signup → Login / Users
- Users → Chat / Login
- Chat → Users

## Next steps (not implemented)
- Firebase (Auth, Firestore, FCM)
- Jotai state (session, selection, presence, typing, read states)
- Real-time chat, read receipts, edit/delete
- Tailwind/NativeWind styling
