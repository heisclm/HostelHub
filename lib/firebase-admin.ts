import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const adminConfig: any = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      credential: admin.credential.applicationDefault(),
    };
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
       adminConfig.credential = admin.credential.cert({
         projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
         privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
       });
    }
    admin.initializeApp(adminConfig);
  } catch (error) {
    console.warn('Firebase Admin initialization failed.', error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
