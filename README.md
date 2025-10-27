# PhotoSys - File Management System

A modern, cloud-based file management system built with HTML, CSS, JavaScript, and Firebase. Upload, organize, preview, and manage your files with ease.

## Features

- 🔐 **User Authentication** - Secure sign up and sign in with Firebase Auth
- 📁 **File Upload** - Upload multiple files at once
- 👁️ **File Preview** - Preview images, PDFs, and videos without downloading
- 📥 **Download Files** - Quick download of any file
- 🗑️ **Delete Files** - Remove files with confirmation
- 🔍 **Filter by Type** - Filter files by images, PDFs, videos, or others
- 📊 **Multiple Views** - Switch between grid and list views
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Real-time Progress** - See upload progress in real-time

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "photosys")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

### 2. Enable Firebase Services

#### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Click "Save"

#### Enable Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose a location close to your users
5. Click "Enable"

#### Enable Storage
1. In Firebase Console, go to **Storage**
2. Click "Get started"
3. Start in **production mode**
4. Click "Next"
5. Review and click "Done"

### 3. Firebase Configuration

Your Firebase configuration is already set up in `js/app.js` with your project credentials. The configuration uses the latest Firebase SDK v12 with modular imports.

### 4. Set Firestore Security Rules

In Firebase Console, go to **Firestore Database** > **Rules** and paste the contents from `firebase/firestore.rules` file, or use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Files collection
    match /files/{fileId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if false; // Prevent updates for now
    }
  }
}
```

### 5. Set Storage Security Rules

In Firebase Console, go to **Storage** > **Rules** and paste the contents from `firebase/storage.rules` file, or use:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Deploy

You can run this locally or deploy to a hosting service:

#### Local Development
1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```

#### Deploy to Firebase Hosting (Recommended)
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```

4. Select your Firebase project
5. Set `index.html` as the public directory
6. Don't configure as a single-page app
7. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Sign In**: Login with your credentials
3. **Upload Files**: Click "Upload Files" button and select files
4. **View Files**: Browse your files in grid or list view
5. **Preview Files**: Click on any file to preview it
6. **Download**: Click the download icon or preview and click download
7. **Delete**: Click the delete icon or preview and click delete
8. **Filter**: Use the sidebar to filter files by type

## File Structure

```
photosys-v2/
├── index.html                  # Entry point (redirects to login)
├── css/
│   └── styles.css              # All styling and design
├── js/
│   ├── app.js                 # Legacy file (can be removed)
│   ├── auth.js                # Authentication logic
│   └── dashboard.js           # Dashboard functionality
├── views/
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   └── dashboard.html          # Main dashboard
├── firebase/
│   ├── firestore.rules         # Firestore security rules
│   └── storage.rules           # Storage security rules
└── README.md                   # This file
```

## Technologies Used

- **HTML5** - Structure and markup
- **CSS3** - Styling and responsive design
- **JavaScript** - Application logic
- **Firebase Auth** - User authentication
- **Firebase Storage** - File storage
- **Firebase Firestore** - File metadata database

## Security Features

- Email/password authentication
- User-specific file storage
- Secure Firestore rules
- Secure Storage rules
- Session management

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Support

For issues or questions, please check the Firebase documentation:
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)

## License

This project is open source and available for educational purposes.

