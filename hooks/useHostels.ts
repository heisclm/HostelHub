import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { getAllVerifiedHostelsWithRooms, getHostelById, getHostelRooms, getVerifiedHostelsPaginated } from '@/services/hostelService';
import { getHostelReviews } from '@/services/reviewService';
import { doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Room } from '@/types';

// Fetcher functions
const hostelsFetcher = () => getAllVerifiedHostelsWithRooms();
const hostelFetcher = (id: string) => getHostelById(id);
const roomsFetcher = (id: string) => getHostelRooms(id);
const reviewsFetcher = (id: string) => getHostelReviews(id);

export function useHostelsPaginated(pageSize = 12) {
  const [hostels, setHostels] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadHostels = useCallback(async (reset = false) => {
    if (isLoading || (!hasMore && !reset)) return;
    
    setIsLoading(true);
    setIsError(null);
    
    try {
      const currentLastVisible = reset ? null : lastVisible;
      const result = await getVerifiedHostelsPaginated(currentLastVisible, pageSize);
      
      setHostels(prev => reset ? result.hostels : [...prev, ...result.hostels]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hostels.length === pageSize);
      setInitialLoaded(true);
    } catch (err: any) {
      setIsError(err);
    } finally {
      setIsLoading(false);
    }
  }, [lastVisible, isLoading, hasMore, pageSize]);

  return {
    hostels,
    isLoading,
    isError,
    hasMore,
    loadHostels,
    initialLoaded
  };
}

export function useHostels() {
  const { data, error, isLoading, mutate } = useSWR('hostels', hostelsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    hostels: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHostelDetails(id: string) {
  const { data: hostel, error: hostelError, isLoading: hostelLoading } = useSWR(
    id ? `hostel-${id}` : null,
    () => hostelFetcher(id),
    { revalidateOnFocus: false }
  );

  const { data: rooms, error: roomsError, isLoading: roomsLoading, mutate: mutateRooms } = useSWR(
    id ? `rooms-${id}` : null,
    () => roomsFetcher(id),
    { revalidateOnFocus: false }
  );

  const { data: reviews, error: reviewsError, isLoading: reviewsLoading, mutate: mutateReviews } = useSWR(
    id ? `reviews-${id}` : null,
    () => reviewsFetcher(id),
    { revalidateOnFocus: false }
  );

  return {
    hostel,
    rooms: rooms || [],
    reviews: reviews || [],
    isLoading: hostelLoading || roomsLoading || reviewsLoading,
    isError: hostelError || roomsError || reviewsError,
    mutateRooms,
    mutateReviews,
  };
}

export function useRoom(hostelId: string | undefined, roomId: string | undefined) {
  const { data: room, error, isLoading, mutate } = useSWR(
    hostelId && roomId ? `room-${hostelId}-${roomId}` : null,
    async () => {
      const roomRef = doc(db, `hostels/${hostelId}/rooms`, roomId!);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        return { id: roomSnap.id, ...roomSnap.data() } as Room;
      }
      return null;
    },
    { revalidateOnFocus: false }
  );

  return {
    room,
    isLoading,
    isError: error,
    mutate,
  };
}
