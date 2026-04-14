import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { Complaint } from '@/types';
import { createNotification } from './notificationService';

export const submitComplaint = async (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'adminVisible'>) => {
  try {
    const docRef = await addDoc(collection(db, 'complaints'), {
      ...complaint,
      status: 'pending',
      adminVisible: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify manager
    if (complaint.managerId) {
      await createNotification(
        complaint.managerId,
        'complaint',
        'New Student Complaint',
        `A student has submitted a new complaint: ${complaint.title}`,
        '/manager/complaints'
      );
    }

    return docRef.id;
  } catch (error: any) {
    console.error('Error submitting complaint:', error);
    throw new Error(error.message || 'Failed to submit complaint');
  }
};

export const getStudentComplaints = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    
    // Sort in frontend to avoid index requirement
    return complaints.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error getting student complaints:', error);
    throw new Error(error.message || 'Failed to get complaints');
  }
};

export const getHostelComplaints = async (hostelId: string) => {
  try {
    const q = query(
      collection(db, 'complaints'),
      where('hostelId', '==', hostelId)
    );
    const querySnapshot = await getDocs(q);
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    
    // Sort in frontend to avoid index requirement
    return complaints.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error getting hostel complaints:', error);
    throw new Error(error.message || 'Failed to get complaints');
  }
};

export const getManagerComplaints = async (managerId: string) => {
  if (!managerId) return [];
  
  try {
    const q = query(
      collection(db, 'complaints'),
      where('managerId', '==', managerId)
    );
    const querySnapshot = await getDocs(q);
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    
    complaints.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });

    return complaints;
  } catch (error: any) {
    console.error('Error getting manager complaints:', error);
    throw new Error(error.message || 'Failed to get manager complaints');
  }
};

export const getAllComplaints = async () => {
  try {
    const q = query(collection(db, 'complaints'));
    const querySnapshot = await getDocs(q);
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    
    return complaints.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error getting all complaints:', error);
    throw new Error(error.message || 'Failed to get all complaints');
  }
};

export const updateComplaintStatus = async (
  complaintId: string, 
  status: 'pending' | 'in-progress' | 'resolved', 
  managerResponse?: string
) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    const complaintDoc = await getDoc(complaintRef);
    
    if (!complaintDoc.exists()) {
      throw new Error('Complaint not found');
    }
    
    const complaintData = complaintDoc.data() as Complaint;

    const updateData: any = { 
      status,
      updatedAt: serverTimestamp()
    };
    
    if (managerResponse !== undefined) {
      updateData.managerResponse = managerResponse;
    }
    
    if (status === 'resolved') {
      updateData.resolvedAt = serverTimestamp();
    }
    
    await updateDoc(complaintRef, updateData);

    // Notify student
    await createNotification(
      complaintData.userId,
      'complaint',
      `Complaint ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
      `Your complaint "${complaintData.title}" has been marked as ${status}.`,
      '/student/complaints'
    );
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    throw new Error(error.message || 'Failed to update complaint');
  }
};

export const deleteComplaint = async (complaintId: string) => {
  try {
    await deleteDoc(doc(db, 'complaints', complaintId));
  } catch (error: any) {
    console.error('Error deleting complaint:', error);
    throw new Error(error.message || 'Failed to delete complaint');
  }
};
