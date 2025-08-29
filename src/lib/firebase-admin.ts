
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let app: admin.app.App;

export function initializeAdminApp() {
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return;
  }
  if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://console.firebase.google.com/project/${serviceAccount.project_id}/overview`,
  });
}

export function getAdminApp(): admin.app.App {
    if (!app) {
        initializeAdminApp();
    }
    return app;
}
