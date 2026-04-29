import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Review } from '@/types';
import { handleFirestoreError } from '@/lib/firebase-errors';

export const submitReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
  const path = `hostels/${review.hostelId}/reviews`;
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    if (!auth.currentUser) throw new Error("You must be logged in to submit a review.");

    const reviewData = {
      ...review,
      userId: auth.currentUser.uid,
      userName: review.userName || auth.currentUser.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
    };

    const reviewRef = await addDoc(collection(db, path), reviewData);

    // Calculate new average
    const reviewsSnapshot = await getDocs(collection(db, path));
    let totalRating = 0;
    let count = 0;
    reviewsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.rating) {
        totalRating += Number(data.rating);
        count++;
      }
    });

    const newAverage = count > 0 ? (totalRating / count) : review.rating;

    // Update hostel document with new average
    await updateDoc(doc(db, 'hostels', review.hostelId), {
      rating: newAverage
    });

    return reviewRef.id;
  } catch (error: any) {
    console.error('Error submitting review:', error);
    if (error instanceof Error && error.message.includes('{')) throw error;
    handleFirestoreError(error, 'write', path);
  }
};

export const getHostelReviews = async (hostelId: string) => {
  try {
    const q = query(
      collection(db, `hostels/${hostelId}/reviews`),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error: any) {
    console.error('Error getting reviews:', error);
    throw new Error(error.message || 'Failed to get reviews');
  }
};
