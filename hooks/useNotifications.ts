import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { AppNotification } from '@/types';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as AppNotification;
        notifs.push({ ...data, id: doc.id });
        if (!data.isRead) {
          unread++;
        }
      });

      setNotifications(notifs);
      setUnreadCount(unread);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, unreadCount, isLoading };
}
