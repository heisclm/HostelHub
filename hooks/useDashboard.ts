import useSWR from 'swr';
import { getStudentBookings, getManagerBookings } from '@/services/bookingService';
import { getHostelById, getManagerHostels, getManagerRooms } from '@/services/hostelService';
import { getStudentComplaints, getManagerComplaints } from '@/services/complaintService';
import { getManagerVerificationStatus } from '@/services/managerService';
import { getManagerInquiries } from '@/services/inquiryService';
import { Booking, Hostel, Room } from '@/types';

// Student Dashboard Hook
export function useStudentDashboard(studentId: string | undefined) {
  const { data: bookings, error: bookingsError, isLoading: bookingsLoading, mutate: mutateBookings } = useSWR(
    studentId ? `student-bookings-${studentId}` : null,
    async () => {
      const studentBookings = await getStudentBookings(studentId!);
      const bookingsWithHostels = await Promise.all(
        studentBookings.map(async (booking) => {
          const hostel = await getHostelById(booking.hostelId);
          return { ...booking, hostel: hostel || undefined };
        })
      );
      return bookingsWithHostels;
    },
    { revalidateOnFocus: false }
  );

  const { data: complaints, error: complaintsError, isLoading: complaintsLoading, mutate: mutateComplaints } = useSWR(
    studentId ? `student-complaints-${studentId}` : null,
    () => getStudentComplaints(studentId!),
    { revalidateOnFocus: false }
  );

  return {
    bookings: bookings || [],
    complaints: complaints || [],
    isLoading: bookingsLoading || complaintsLoading,
    isError: bookingsError || complaintsError,
    mutateBookings,
    mutateComplaints,
  };
}

// Manager Dashboard Hook
export function useManagerDashboard(managerId: string | undefined) {
  const { data: hostels, error: hostelsError, isLoading: hostelsLoading } = useSWR(
    managerId ? `manager-hostels-${managerId}` : null,
    () => getManagerHostels(managerId!),
    { revalidateOnFocus: false }
  );

  const hostelIds = hostels?.map(h => h.id!) || [];

  const { data: bookings, error: bookingsError, isLoading: bookingsLoading, mutate: mutateBookings } = useSWR(
    managerId ? `manager-bookings-${managerId}` : null,
    () => getManagerBookings(managerId!),
    { revalidateOnFocus: false }
  );

  const { data: complaints, error: complaintsError, isLoading: complaintsLoading, mutate: mutateComplaints } = useSWR(
    managerId ? `manager-complaints-${managerId}` : null,
    () => getManagerComplaints(managerId!),
    { revalidateOnFocus: false }
  );

  const { data: inquiries, error: inquiriesError, isLoading: inquiriesLoading, mutate: mutateInquiries } = useSWR(
    managerId ? `manager-inquiries-${managerId}` : null,
    () => getManagerInquiries(managerId!),
    { revalidateOnFocus: false }
  );

  const { data: rooms, error: roomsError, isLoading: roomsLoading, mutate: mutateRooms } = useSWR(
    managerId ? `manager-rooms-${managerId}` : null,
    () => getManagerRooms(managerId!),
    { revalidateOnFocus: false }
  );

  const { data: verificationStatus, mutate: mutateVerification } = useSWR(
    managerId ? `manager-verification-${managerId}` : null,
    () => getManagerVerificationStatus(managerId!),
    { revalidateOnFocus: false }
  );

  return {
    hostels: hostels || [],
    bookings: bookings || [],
    complaints: complaints || [],
    inquiries: inquiries || [],
    rooms: rooms || [],
    verificationStatus,
    isLoading: hostelsLoading || bookingsLoading || complaintsLoading || inquiriesLoading || roomsLoading,
    isError: hostelsError || bookingsError || complaintsError || inquiriesError || roomsError,
    mutateBookings,
    mutateComplaints,
    mutateInquiries,
    mutateRooms,
    mutateVerification,
  };
}

export function useManagerVerification(managerId: string | undefined) {
  const { data: verificationStatus, error, isLoading, mutate } = useSWR(
    managerId ? `manager-verification-${managerId}` : null,
    () => getManagerVerificationStatus(managerId!),
    { revalidateOnFocus: false }
  );

  return {
    verificationStatus,
    isLoading,
    isError: error,
    mutate,
  };
}
