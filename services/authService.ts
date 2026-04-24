import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User as AppUser } from '@/types';
import { handleFirestoreError } from '@/lib/firebase-errors';

export const registerUser = async (email: string, password: string, name: string, role: 'student' | 'manager' | 'guest') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userData: AppUser = {
      uid: user.uid,
      email: user.email!,
      role,
      displayName: name,
      createdAt: new Date()
    };

    // Store user role and profile in Firestore
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), userData);
    } catch (dbError) {
      handleFirestoreError(dbError, 'create', path);
    }

    return { user, userData };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('{')) throw error; // Already handled by handleFirestoreError
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<{ user: any, userData: AppUser }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user role
    const path = `users/${user.uid}`;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { user, userData: userDoc.data() as AppUser };
      } else {
        throw new Error("User profile not found in database.");
      }
    } catch (dbError) {
      handleFirestoreError(dbError, 'get', path);
    }
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('{')) throw error; 
    console.error("Login error:", error);
    throw error;
  }
  throw new Error("Unexpected login failure");
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
