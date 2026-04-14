import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createNotification } from './notificationService';
import { sendManagerVerificationEmail } from './emailService';

export interface ManagerVerification {
  id?: string;
  userId: string;
  managerName?: string;
  managerEmail?: string;
  idDocumentUrl: string;
  propertyProofUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: any;
  updatedAt?: any;
  adminNotes?: string;
  user?: any; // Fallback for older records
}

export const submitVerification = async (
  userId: string,
  managerName: string | undefined,
  managerEmail: string | undefined,
  idDocumentFile: File,
  propertyProofFile: File
) => {
  try {
    // 1. Upload ID Document
    const idDocRef = ref(storage, `manager_documents/${userId}/id_${Date.now()}_${idDocumentFile.name}`);
    await uploadBytes(idDocRef, idDocumentFile);
    const idDocumentUrl = await getDownloadURL(idDocRef);

    // 2. Upload Property Proof
    const propProofRef = ref(storage, `manager_documents/${userId}/prop_${Date.now()}_${propertyProofFile.name}`);
    await uploadBytes(propProofRef, propertyProofFile);
    const propertyProofUrl = await getDownloadURL(propProofRef);

    // 3. Create Verification Document
    const verificationData = {
      userId,
      managerName: managerName || 'Unknown',
      managerEmail: managerEmail || 'No email provided',
      idDocumentUrl,
      propertyProofUrl,
      status: 'pending',
      submittedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'managerVerifications'), verificationData);
    
    // Notify admins
    const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminsSnapshot = await getDocs(adminsQuery);
    adminsSnapshot.forEach((adminDoc) => {
      createNotification(
        adminDoc.id,
        'verification',
        'New Manager Application',
        `${managerName || 'A new manager'} has submitted verification documents.`,
        '/admin/verifications'
      );
    });

    return docRef.id;
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    throw new Error(error.message || 'Failed to submit verification');
  }
};

export const getManagerVerificationStatus = async (userId: string) => {
  try {
    const q = query(collection(db, 'managerVerifications'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the most recent one if there are multiple
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManagerVerification));
    docs.sort((a, b) => b.submittedAt?.toMillis() - a.submittedAt?.toMillis());
    return docs[0];
  } catch (error: any) {
    console.error('Error getting verification status:', error);
    throw new Error(error.message || 'Failed to get verification status');
  }
};

export const getAllVerifications = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'managerVerifications'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManagerVerification));
  } catch (error: any) {
    console.error('Error getting all verifications:', error);
    throw new Error(error.message || 'Failed to get verifications');
  }
};

export const updateVerificationStatus = async (verificationId: string, status: 'verified' | 'rejected', adminNotes?: string) => {
  try {
    const verificationRef = doc(db, 'managerVerifications', verificationId);
    const verificationDoc = await getDoc(verificationRef);
    
    if (!verificationDoc.exists()) {
      throw new Error('Verification not found');
    }
    
    const verificationData = verificationDoc.data() as ManagerVerification;

    await updateDoc(verificationRef, {
      status,
      adminNotes: adminNotes || '',
      updatedAt: serverTimestamp(),
    });

    // Send notification to manager
    await createNotification(
      verificationData.userId,
      'verification',
      `Verification ${status === 'verified' ? 'Approved' : 'Rejected'}`,
      status === 'verified' 
        ? 'Your manager account has been verified. You can now manage hostels.' 
        : `Your verification was rejected. ${adminNotes ? `Reason: ${adminNotes}` : ''}`,
      '/manager/verify'
    );

    // Send Email notification to manager
    if (verificationData.managerEmail && verificationData.managerEmail !== 'No email provided') {
      await sendManagerVerificationEmail(verificationData.managerEmail, status, adminNotes);
    }

    // If verified, update the user's role to manager
    if (status === 'verified') {
      const userRef = doc(db, 'users', verificationData.userId);
      await updateDoc(userRef, { role: 'manager' });
    }
  } catch (error: any) {
    console.error('Error updating verification status:', error);
    throw new Error(error.message || 'Failed to update verification status');
  }
};
