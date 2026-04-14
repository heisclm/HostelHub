import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { AppNotification } from '@/types';

export const createNotification = async (
  userId: string,
  type: AppNotification['type'],
  title: string,
  message: string,
  actionUrl?: string
) => {
  try {
    const notificationData = {
      userId,
      type,
      title,
      message,
      actionUrl: actionUrl || '',
      isRead: false,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
    // We don't throw here because notifications shouldn't break the main flow if they fail
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => {
      batch.update(document.ref, { isRead: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};
