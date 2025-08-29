
import * as admin from 'firebase-admin';

// This is required to be able to access environment variables from Vercel
import 'dotenv/config';

// To find your service account key, go to your Firebase project settings,
// then to the Service Accounts tab. Click "Generate new private key".
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let app: admin.app.App | undefined;
let initialized = false;

export function initializeAdminApp() {
  if (initialized) {
    return;
  }
  initialized = true; // Attempt initialization only once

  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return;
  }

  if (!serviceAccount) {
    console.warn(
      'Firebase Admin SDK not initialized. The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing. Backend operations like user creation will not work.'
    );
    return;
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://console.firebase.google.com/project/${serviceAccount.project_id}/overview`,
    });
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    app = undefined;
  }
}

export function getAdminApp(): admin.app.App | undefined {
    if (!initialized) {
        initializeAdminApp();
    }
    return app;
}
