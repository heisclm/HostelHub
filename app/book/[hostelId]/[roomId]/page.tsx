'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBooking } from '@/services/bookingService';
import { useHostelDetails, useRoom } from '@/hooks/useHostels';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const hostelId = params.hostelId as string;
  const roomId = params.roomId as string;
  const { user, userData } = useAuth();

  const { hostel, isLoading: hostelLoading } = useHostelDetails(hostelId);
  const { room, isLoading: roomLoading } = useRoom(hostelId, roomId);
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const isLoading = hostelLoading || roomLoading;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!isLoading) {
      if (!hostel) {
        toast.error('Hostel not found');
        router.push('/hostels');
        return;
      }
      if (!room) {
        toast.error('Room not found');
        router.push(`/hostels/${hostelId}`);
        return;
      }
      if (!room.isAvailable || room.occupiedBeds >= room.capacity) {
        toast.error('This room is no longer available.');
        router.push(`/hostels/${hostelId}`);
      }
    }
  }, [isLoading, hostel, room, hostelId, router]);

  const handleConfirmBooking = async () => {
    if (!user || !room || !hostel) return;
    
    setIsBooking(true);
    try {
      await createBooking(hostelId, roomId, user.uid, user.email!, room.pricePerSemester);
      
      // Send notification
      try {
        const token = await user.getIdToken();
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'booking_confirmation',
            to: {
              email: user.email,
            },
            data: {
              userName: user.displayName || user.email,
              roomType: room.type,
              hostelName: hostel.name,
              amount: room.pricePerSemester
            }
          })
        });
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
      }

      setBookingSuccess(true);
      toast.success('Booking successful!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book room. It might be full.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!hostel || !room) return null;

  if (bookingSuccess) {
    return (
      <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-900 p-12 text-center">
          <div className="w-20 h-20 border border-slate-900 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-4xl font-heading font-bold uppercase tracking-tighter mb-4">Confirmed.</h1>
          <p className="text-slate-500 mb-12 text-sm leading-relaxed">
            You have successfully booked a bed in <strong className="text-slate-900">{room.type}</strong> at <strong className="text-slate-900">{hostel.name}</strong>.
          </p>
          <div className="space-y-4">
            <button 
              className="w-full bg-slate-900 text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors" 
              onClick={() => router.push('/student/dashboard')}
            >
              Dashboard
            </button>
            <button 
              className="w-full bg-transparent text-slate-900 border border-slate-900 py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors" 
              onClick={() => router.push('/hostels')}
            >
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hostel
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <h1 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-none mb-12 text-center">
          Confirm <br/> Booking.
        </h1>

        <div className="border border-slate-900">
          <div className="p-8 border-b border-slate-900 bg-slate-50">
            <h2 className="text-xl font-heading font-bold uppercase tracking-tighter">Summary</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start pb-8 border-b border-slate-200">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-lg mb-1">{hostel.name}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{hostel.location}</p>
              </div>
              <div className="text-right">
                <p className="font-bold uppercase tracking-wider text-lg mb-1">{room.type}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Room {room.roomNumber}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold uppercase tracking-widest text-slate-500 text-xs">Student Name</span>
                <span className="font-bold text-slate-900">{userData?.displayName || user?.displayName || user?.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold uppercase tracking-widest text-slate-500 text-xs">Semester Fee</span>
                <span className="font-bold text-slate-900">GH₵{room.pricePerSemester}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold uppercase tracking-widest text-slate-500 text-xs">Booking Fee</span>
                <span className="font-bold text-slate-900">GH₵0 (Free)</span>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-900 flex justify-between items-end">
              <span className="font-bold uppercase tracking-widest text-xs">Total to Pay</span>
              <span className="font-heading font-bold text-4xl tracking-tighter">GH₵{room.pricePerSemester}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 text-sm text-slate-600 leading-relaxed">
              By confirming this booking, a bed will be reserved for you. You will need to complete the payment within 48 hours to secure your spot.
            </div>

            <button 
              className="w-full bg-slate-900 text-white py-5 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              onClick={handleConfirmBooking}
              disabled={isBooking}
            >
              {isBooking ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

