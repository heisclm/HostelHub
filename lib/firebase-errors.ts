import { auth } from './firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  } | null;
}

/**
 * Standardizes Firestore error reporting.
 * Throws a JSON string of FirestoreErrorInfo if it's a permission error.
 */
export function handleFirestoreError(
  error: any,
  operationType: FirestoreErrorInfo['operationType'],
  path: string | null = null
): never {
  const user = auth.currentUser;
  
  const errorInfo: FirestoreErrorInfo = {
    error: error?.message || 'Unknown Firestore error',
    operationType,
    path,
    authInfo: user ? {
      userId: user.uid,
      email: user.email || '',
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      providerInfo: user.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })),
    } : null,
  };

  if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
    console.error('Firestore Permission Denied:', errorInfo);
    throw new Error(JSON.stringify(errorInfo));
  }

  throw error;
}
