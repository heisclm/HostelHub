import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Payout, Booking, Hostel, User } from '@/types';

export const recordPayout = async (payout: Omit<Payout, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'payouts'), {
      ...payout,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error recording payout:', error);
    throw new Error(error.message || 'Failed to record payout');
  }
};

export const getManagerBalances = async () => {
  try {
    // Fetch managers
    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'manager')));
    const managers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

    // Fetch hostels to map bookings to managers
    const hostelsSnapshot = await getDocs(query(collection(db, 'hostels')));
    const hostels = hostelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hostel));

    // Fetch paid bookings
    const bookingsSnapshot = await getDocs(query(collection(db, 'bookings'), where('paymentStatus', '==', 'paid')));
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));

    // Fetch all payouts
    const payoutsSnapshot = await getDocs(query(collection(db, 'payouts')));
    const payouts = payoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payout));

    const managerBalances = managers.map(manager => {
      const managerHostels = hostels.filter(h => h.managerId === manager.uid).map(h => h.id);
      
      const managerBookings = bookings.filter(b => managerHostels.includes(b.hostelId));
      const totalEarned = managerBookings.reduce((sum, b) => sum + b.amount, 0);
      
      const managerPayouts = payouts.filter(p => p.managerId === manager.uid);
      const totalPaid = managerPayouts.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        managerId: manager.uid,
        managerName: manager.displayName || manager.email,
        managerEmail: manager.email,
        totalEarned,
        totalPaid,
        pendingBalance: totalEarned - totalPaid,
        lastPayout: managerPayouts.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return dateB - dateA;
        })[0]?.createdAt?.toDate() || null
      };
    });

    return managerBalances.sort((a, b) => b.pendingBalance - a.pendingBalance);
  } catch (error: any) {
    console.error('Error fetching manager balances:', error);
    throw new Error('Failed to fetch manager balances');
  }
};

export const getPayoutHistory = async (managerId?: string) => {
  try {
    let q = query(collection(db, 'payouts'));
    if (managerId) {
      q = query(collection(db, 'payouts'), where('managerId', '==', managerId));
    }
    const querySnapshot = await getDocs(q);
    const payouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payout));
    
    return payouts.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error fetching payout history:', error);
    throw new Error('Failed to fetch payout history');
  }
};
