# Deploy PhotoSys to Firebase Hosting

This guide will help you deploy your PhotoSys application to Firebase Hosting.

## Prerequisites

✅ Firebase CLI is installed (already done)
✅ Firebase configuration files are created (`.firebaserc` and `firebase.json`)

## Steps to Deploy

### Step 1: Login to Firebase

Open your terminal (PowerShell) in the project directory and run:

```bash
firebase login
```

This will open a browser window. Log in with your Google account that has access to the `photosys-5454c` Firebase project.

### Step 2: Deploy to Firebase Hosting

Once you're logged in, run:

```bash
firebase deploy --only hosting
```

This will:
- Upload all your files to Firebase Hosting
- Provide you with a live URL where your app is hosted

### Step 3: Access Your Live App

After deployment, Firebase will provide you with URLs like:
- `https://photosys-5454c.web.app`
- `https://photosys-5454c.firebaseapp.com`

## What Gets Deployed?

- All HTML files (`index.html`, `views/*.html`)
- All JavaScript files (`js/*.js`)
- All CSS files (`css/styles.css`)
- All static assets

## Important Notes

1. **Test Mode**: Your Firestore database is still in test mode. You should set up proper security rules before production use.

2. **Storage**: Make sure Firebase Storage is enabled in your Firebase Console:
   - Go to: https://console.firebase.google.com/project/photosys-5454c/storage
   - Click "Get started"

3. **Firestore**: Make sure Firestore is enabled:
   - Go to: https://console.firebase.google.com/project/photosys-5454c/firestore
   - Database is already created

## Updating Your Deployment

To update your deployed app after making changes:

```bash
firebase deploy --only hosting
```

## View Deployment

You can view your deployment history and manage your hosting:
- Go to: https://console.firebase.google.com/project/photosys-5454c/hosting

## Troubleshooting

### If deployment fails:

1. Make sure you're in the correct directory
2. Make sure you're logged in: `firebase login`
3. Make sure the project ID matches in `.firebaserc`

### If the app doesn't work after deployment:

1. Check the browser console for errors
2. Make sure all file paths are correct (check relative paths)
3. Verify Firebase services are enabled in the console

