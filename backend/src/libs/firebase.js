import dotenv from 'dotenv';
import firebaseAdmin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';  // Correct import

dotenv.config();

// Initialize Firebase Admin only if not already initialized
if (!firebaseAdmin.apps.length) {
  
  initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // replace `\` and `n` character pairs w/ single `\n` character
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });

  console.log("🔥 Firebase Admin SDK initialized!");
}

// Export initialized Firebase instance
export default firebaseAdmin;
