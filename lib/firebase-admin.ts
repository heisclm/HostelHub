import * as admin from 'firebase-admin';

let firebaseConfig: any = { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID };
if (!firebaseConfig.projectId) {
  try {
    firebaseConfig = require('../firebase-config.json');
  } catch (e) {
    console.error("Firebase config not found for admin setup.");
  }
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed.', error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
