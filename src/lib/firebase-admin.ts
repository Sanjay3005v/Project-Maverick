
import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  admin.initializeApp({
    // When deployed to App Hosting, it automatically discovers the credentials.
    // For local development, you need to set up a service account.
    // See: https://firebase.google.com/docs/admin/setup
    credential: admin.credential.applicationDefault(),
  });
}

const auth = admin.auth();

export { auth };
