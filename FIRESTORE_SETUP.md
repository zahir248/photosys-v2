# Firestore Setup Guide

## Current Situation

Your Firestore is set to **MongoDB compatibility mode**, which doesn't work with the standard Firebase Web SDK.

## Option 1: Keep Current Setup (Recommended for Now)
- ✅ **localStorage** works perfectly
- ✅ No additional setup needed
- ✅ Free and fast
- ❌ Files stored only in browser

## Option 2: Use Native Firestore

To use Native Firestore properly:

### Step 1: Create a New Native Firestore Database

1. Go to: https://console.firebase.google.com/project/photosys-5454c/firestore
2. Click **"Add Database"** (to create a NEW database)
3. Choose **"Native mode"** (NOT MongoDB compatibility)
4. Select a location (same as your current database)
5. Click **"Create"**

### Step 2: Update Firebase Config

Once you have the new database, you'll need to update the connection in your web app.

### Step 3: Update Security Rules

Set up rules for your collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Option 3: Use MongoDB Directly (Complex)

This would require:
1. Setting up a Firebase Functions backend
2. Using the MongoDB connection string
3. Creating REST API endpoints
4. Much more complex implementation

## Recommendation

**Stick with localStorage for now.** It's:
- ✅ Simple
- ✅ Free
- ✅ Fast
- ✅ No setup
- ✅ Works immediately

If you need cloud storage later, then switch to Native Firestore with a new database.

