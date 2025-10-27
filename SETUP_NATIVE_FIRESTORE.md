# Setup Native Firestore

## Current Problem

Your Firestore is in **MongoDB compatibility mode**, but the web app needs **Native Firestore**.

## Solution: Enable Native Firestore

### Step 1: Create a Native Firestore Database

1. Go to: https://console.firebase.google.com/project/photosys-5454c/firestore
2. Click **"Add Database"** (to create a NEW database)
3. Choose **"Native mode"** (NOT MongoDB compatibility)
4. Select a location (e.g., `asia-southeast1` - same as your current database)
5. Click **"Create"**

⚠️ **Note**: Creating a new database **may require billing to be enabled**.

### Step 2: Update Your App

Once you have a native Firestore database, the app will automatically use it. No code changes needed!

### Step 3: Deploy Security Rules (Optional)

```bash
firebase deploy --only firestore:rules
```

## Why This Happened

The original database was created with MongoDB compatibility mode, which is designed for:
- Server applications using MongoDB drivers
- NOT web applications using the Firebase SDK

## Current Status

✅ **Your app works NOW** using localStorage as a fallback
✅ **No immediate action needed**
✅ **When you're ready**, enable billing and create a native database

## Alternative: Keep Current Setup

If you don't want to enable billing right now:
- The app works perfectly with localStorage
- Files are stored in the browser
- All features work (upload, preview, download, delete)
- No payment required

## To Use Firestore Later

When you're ready to upgrade:
1. Enable billing (free tier covers most usage)
2. Create native Firestore database (takes 2 minutes)
3. Deploy security rules
4. App automatically switches from localStorage to Firestore

Your app is fully functional right now with localStorage! 🎉

