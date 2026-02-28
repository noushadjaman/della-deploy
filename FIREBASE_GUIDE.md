# Firebase Integration Guide for Della

This project has Firebase pre-configured in `src/firebase.js`. Follow these steps to complete the integration.

## Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the setup wizard.
3. Give your project a name (e.g., "Della-Ecommerce").
4. Disable Google Analytics for this project (for simplicity) or enable it if you wish.
5. Click **Create project**.

## Step 2: Register Your App
1. In the Firebase Console dashboard, click the **Web icon** (`</>`) to add a web app.
2. Enter a nickname for your app (e.g., "Della Web").
3. Click **Register app**.

## Step 3: Get Your Configuration
1. After registering, you will see a code snippet with `firebaseConfig`.
2. Copy the values from the `firebaseConfig` object (apiKey, authDomain, projectId, etc.).

## Step 4: Update Your Code
1. Open the file `src/firebase.js` in your project.
2. Replace the placeholder strings (`"YOUR_API_KEY"`, etc.) with the actual values you copied from the Firebase Console.

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "della-ecommerce.firebaseapp.com",
  projectId: "della-ecommerce",
  storageBucket: "della-ecommerce.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 5: Enable Features (Optional)
### Authentication
1. Go to **Build > Authentication** in the Firebase Console.
2. Click **Get started**.
3. Enable **Email/Password** or **Google** sign-in providers.

### Firestore Database
1. Go to **Build > Firestore Database**.
2. Click **Create database**.
3. Start in **Test mode** for development.

## Usage in Components
You can now import the initialized `app` or specific services in your components.

Example for Auth:
```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from '../firebase';

const auth = getAuth(app);
// ... use auth
```
