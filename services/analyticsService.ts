import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Booking, Hostel, Room, User } from '@/types';

// Helper to format dates for charts
const formatMonth = (date: Date) => {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

export const getAdminAnalytics = async () => {
  try {
    // Fetch all bookings
    const bookingsSnapshot = await getDocs(query(collection(db, 'bookings')));
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));

    // Fetch all hostels
    const hostelsSnapshot = await getDocs(query(collection(db, 'hostels')));
    const hostels = hostelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hostel));

    // Fetch all users (managers)
    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'manager')));
    const managers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

    // 1. Total System Revenue & Paid vs Unpaid
    let totalRevenue = 0;
    let paidBookings = 0;
    let unpaidBookings = 0;

    const revenueOverTimeMap = new Map<string, number>();
    const hostelRevenueMap = new Map<string, number>();
    const managerRevenueMap = new Map<string, number>();
    const managerBookingsMap = new Map<string, number>();

    bookings.forEach(booking => {
      if (booking.paymentStatus === 'paid') {
        totalRevenue += booking.amount;
        paidBookings++;

        // Revenue over time
        if (booking.createdAt?.toDate) {
          const month = formatMonth(booking.createdAt.toDate());
          revenueOverTimeMap.set(month, (revenueOverTimeMap.get(month) || 0) + booking.amount);
        }

        // Revenue per hostel
        hostelRevenueMap.set(booking.hostelId, (hostelRevenueMap.get(booking.hostelId) || 0) + booking.amount);

        // Revenue per manager (need to find manager via hostel)
        const hostel = hostels.find(h => h.id === booking.hostelId);
        if (hostel) {
          managerRevenueMap.set(hostel.managerId, (managerRevenueMap.get(hostel.managerId) || 0) + booking.amount);
        }
      } else {
        unpaidBookings++;
      }

      // Count bookings per manager
      const hostel = hostels.find(h => h.id === booking.hostelId);
      if (hostel) {
        managerBookingsMap.set(hostel.managerId, (managerBookingsMap.get(hostel.managerId) || 0) + 1);
      }
    });

    // Format Revenue Over Time for Recharts
    const revenueOverTime = Array.from(revenueOverTimeMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Format Top Hostels
    const topHostels = Array.from(hostelRevenueMap.entries())
      .map(([hostelId, revenue]) => {
        const hostel = hostels.find(h => h.id === hostelId);
        return { name: hostel?.name || 'Unknown', revenue };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Format Managers Table Data
    const managersData = managers.map(manager => {
      const managerHostels = hostels.filter(h => h.managerId === manager.uid);
      return {
        id: manager.uid,
        name: manager.displayName || manager.email,
        totalHostels: managerHostels.length,
        totalBookings: managerBookingsMap.get(manager.uid) || 0,
        totalRevenue: managerRevenueMap.get(manager.uid) || 0,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      totalRevenue,
      totalBookings: bookings.length,
      paidBookings,
      unpaidBookings,
      revenueOverTime,
      topHostels,
      managersData
    };
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    throw new Error('Failed to fetch analytics data');
  }
};

export const getManagerAnalytics = async (managerId: string) => {
  try {
    // Fetch manager's hostels
    const hostelsSnapshot = await getDocs(query(collection(db, 'hostels'), where('managerId', '==', managerId)));
    const hostels = hostelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hostel));
    const hostelIds = hostels.map(h => h.id!);

    if (hostelIds.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        paidBookings: 0,
        unpaidBookings: 0,
        occupancyRate: 0,
        bookingTrends: [],
        recentTransactions: []
      };
    }

    // Fetch rooms for occupancy rate
    let totalCapacity = 0;
    let totalOccupied = 0;
    
    // We have to query rooms for each hostel (Firestore 'in' query limit is 30, but usually managers have < 30 hostels)
    const chunks = [];
    for (let i = 0; i < hostelIds.length; i += 30) {
      chunks.push(hostelIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      const roomsSnapshot = await getDocs(query(collection(db, 'rooms'), where('hostelId', 'in', chunk)));
      roomsSnapshot.docs.forEach(doc => {
        const room = doc.data() as Room;
        totalCapacity += room.capacity;
        totalOccupied += room.occupiedBeds;
      });
    }

    const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

    // Fetch bookings for these hostels
    const allBookings: Booking[] = [];
    for (const chunk of chunks) {
      const bookingsSnapshot = await getDocs(query(collection(db, 'bookings'), where('hostelId', 'in', chunk)));
      bookingsSnapshot.docs.forEach(doc => {
        allBookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
    }

    let totalRevenue = 0;
    let paidBookings = 0;
    let unpaidBookings = 0;
    const bookingTrendsMap = new Map<string, number>();
    const recentTransactions: any[] = [];

    allBookings.forEach(booking => {
      if (booking.paymentStatus === 'paid') {
        totalRevenue += booking.amount;
        paidBookings++;
        
        // Add to recent transactions
        const hostel = hostels.find(h => h.id === booking.hostelId);
        recentTransactions.push({
          id: booking.id,
          studentEmail: booking.studentEmail,
          hostelName: hostel?.name || 'Unknown',
          amount: booking.amount,
          date: booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date()
        });
      } else {
        unpaidBookings++;
      }

      // Booking trends (count per month)
      if (booking.createdAt?.toDate) {
        const month = formatMonth(booking.createdAt.toDate());
        bookingTrendsMap.set(month, (bookingTrendsMap.get(month) || 0) + 1);
      }
    });

    // Format Booking Trends
    const bookingTrends = Array.from(bookingTrendsMap.entries())
      .map(([month, bookings]) => ({ month, bookings }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Sort and slice recent transactions
    recentTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Fetch payouts for this manager
    const payoutsSnapshot = await getDocs(query(collection(db, 'payouts'), where('managerId', '==', managerId)));
    const payouts = payoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    let totalPaid = 0;
    const payoutHistory: any[] = [];
    payouts.forEach(p => {
      totalPaid += p.amount;
      payoutHistory.push({
        id: p.id,
        amount: p.amount,
        reference: p.reference || 'N/A',
        notes: p.notes || '',
        date: p.createdAt?.toDate ? p.createdAt.toDate() : new Date()
      });
    });
    payoutHistory.sort((a, b) => b.date.getTime() - a.date.getTime());

    const pendingBalance = totalRevenue - totalPaid;

    return {
      totalRevenue,
      totalPaid,
      pendingBalance,
      totalBookings: allBookings.length,
      paidBookings,
      unpaidBookings,
      occupancyRate,
      bookingTrends,
      recentTransactions: recentTransactions.slice(0, 10),
      payoutHistory
    };

  } catch (error: any) {
    console.error('Error fetching manager analytics:', error);
    throw new Error('Failed to fetch manager analytics');
  }
};
