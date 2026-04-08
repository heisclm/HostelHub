import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, serverTimestamp, query, where, getDocs, orderBy, updateDoc, Timestamp } from 'firebase/firestore';
import { Booking, Room } from '@/types';

export const createBooking = async (
  hostelId: string,
  roomId: string,
  studentId: string,
  studentEmail: string,
  amount: number
) => {
  try {
    const roomRef = doc(db, `hostels/${hostelId}/rooms`, roomId);
    const bookingsRef = collection(db, 'bookings');

    const bookingId = await runTransaction(db, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) {
        throw new Error('Room does not exist!');
      }

      const roomData = roomDoc.data() as Room;

      if (!roomData.isAvailable) {
        throw new Error('Room is not available for booking.');
      }

      if (roomData.occupiedBeds >= roomData.capacity) {
        throw new Error('Room is fully booked.');
      }

      // Check if student already has an active booking for this room (or any room)
      // Note: In a transaction, queries are not allowed, so we do this check outside or accept the risk.
      // A better approach is to check outside the transaction first, but for strict concurrency, 
      // we rely on the transaction to update the room's occupiedBeds safely.

      // Increment occupied beds
      transaction.update(roomRef, {
        occupiedBeds: roomData.occupiedBeds + 1,
        isAvailable: roomData.occupiedBeds + 1 < roomData.capacity
      });

      // Calculate expiry time (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      // Create booking document
      const newBookingRef = doc(bookingsRef);
      const newBooking: Omit<Booking, 'id'> = {
        hostelId,
        roomId,
        roomNumber: roomData.roomNumber,
        studentId,
        studentEmail,
        status: 'pending',
        amount,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      transaction.set(newBookingRef, newBooking);

      return newBookingRef.id;
    });

    return bookingId;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw new Error(error.message || 'Failed to create booking');
  }
};

export const updateBookingPaymentStatus = async (
  bookingId: string, 
  paymentStatus: 'pending' | 'paid' | 'cancelled', 
  status?: 'pending' | 'approved' | 'confirmed' | 'cancelled'
) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const updateData: any = { paymentStatus };
    if (status) {
      updateData.status = status;
    }
    await updateDoc(bookingRef, updateData);
  } catch (error: any) {
    console.error('Error updating booking payment status:', error);
    throw new Error(error.message || 'Failed to update booking');
  }
};

export const cancelBooking = async (bookingId: string, hostelId: string, roomId: string) => {
  try {
    const roomRef = doc(db, `hostels/${hostelId}/rooms`, roomId);
    const bookingRef = doc(db, 'bookings', bookingId);

    await runTransaction(db, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) {
        throw new Error('Room does not exist!');
      }

      const roomData = roomDoc.data() as Room;

      // Decrement occupied beds
      const newOccupiedBeds = Math.max(0, roomData.occupiedBeds - 1);
      transaction.update(roomRef, {
        occupiedBeds: newOccupiedBeds,
        isAvailable: newOccupiedBeds < roomData.capacity
      });

      // Update booking status
      transaction.update(bookingRef, {
        status: 'cancelled'
      });
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    throw new Error(error.message || 'Failed to cancel booking');
  }
};

export const getStudentBookings = async (studentId: string) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('studentId', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    
    // Sort in frontend to avoid index requirement
    return bookings.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error getting student bookings:', error);
    throw new Error(error.message || 'Failed to get bookings');
  }
};

export const getManagerBookings = async (hostelIds: string[]) => {
  if (!hostelIds || hostelIds.length === 0) return [];
  
  try {
    // Firestore 'in' query supports up to 30 items.
    // If a manager has more than 30 hostels, we chunk the requests.
    const chunks = [];
    for (let i = 0; i < hostelIds.length; i += 30) {
      chunks.push(hostelIds.slice(i, i + 30));
    }

    const allBookings: Booking[] = [];
    
    for (const chunk of chunks) {
      const q = query(
        collection(db, 'bookings'),
        where('hostelId', 'in', chunk)
      );
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      allBookings.push(...bookings);
    }
    
    // Sort all bookings by createdAt desc
    allBookings.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });

    return allBookings;
  } catch (error: any) {
    console.error('Error getting manager bookings:', error);
    throw new Error(error.message || 'Failed to get manager bookings');
  }
};
