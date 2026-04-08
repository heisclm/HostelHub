'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useManagerDashboard } from '@/hooks/useDashboard';
import { updateBookingPaymentStatus } from '@/services/bookingService';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';

export default function ManagerBookingsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { bookings, isLoading, mutateBookings } = useManagerDashboard(user?.uid);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || userData?.role !== 'manager') {
      router.push('/');
    }
  }, [user, userData, router]);

  const handleUpdateStatus = async (id: string, paymentStatus: 'pending' | 'paid' | 'cancelled', status?: 'pending' | 'approved' | 'confirmed' | 'cancelled') => {
    try {
      await updateBookingPaymentStatus(id, paymentStatus, status);
      toast.success(`Booking updated successfully`);
      mutateBookings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => router.push('/manager/dashboard')} 
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-[0.9]">
            Bookings.
          </h1>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by email or ID..." 
              className="w-full bg-transparent border border-slate-900 pl-10 md:pl-12 pr-4 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none focus:bg-slate-50 transition-all rounded-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="border border-slate-900 p-10 md:p-12 text-center bg-slate-50">
            <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">No bookings found.</p>
          </div>
        ) : (
          <div className="border border-slate-900 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-4 md:p-6 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border-r border-slate-800">Date</th>
                    <th className="p-4 md:p-6 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border-r border-slate-800">Student</th>
                    <th className="p-4 md:p-6 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border-r border-slate-800">Amount</th>
                    <th className="p-4 md:p-6 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border-r border-slate-800">Status</th>
                    <th className="p-4 md:p-6 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-900 hover:bg-slate-50 transition-colors">
                      <td className="p-4 md:p-6 text-[10px] md:text-xs font-bold border-r border-slate-900">
                        {booking.createdAt?.toDate().toLocaleDateString()}
                      </td>
                      <td className="p-4 md:p-6 border-r border-slate-900">
                        <p className="text-xs md:text-sm font-bold uppercase tracking-wider truncate max-w-[150px] md:max-w-none">{booking.studentEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[8px] md:text-[10px] text-slate-400 font-mono">ID: {booking.id?.substring(0, 8)}...</p>
                          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-1.5 py-0.5">Room {booking.roomNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-xs md:text-sm font-bold border-r border-slate-900">
                        GH₵{booking.amount}
                      </td>
                      <td className="p-4 md:p-6 border-r border-slate-900">
                        <span className={`inline-flex items-center gap-1.5 md:gap-2 px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border ${
                          booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 
                          booking.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {booking.paymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : 
                           booking.paymentStatus === 'cancelled' ? <XCircle className="w-3 h-3" /> : 
                           <Clock className="w-3 h-3" />}
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="flex flex-wrap gap-2">
                          {booking.status === 'pending' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.id!, 'pending', 'approved')}
                              className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-900 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                            >
                              Approve Application
                            </button>
                          )}
                          
                          {booking.paymentStatus === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id!, 'paid', 'confirmed')}
                                className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-900 text-slate-900 text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                              >
                                Mark Paid (Offline)
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id!, 'cancelled', 'cancelled')}
                                className="px-3 py-1.5 md:px-4 md:py-2 border border-red-200 text-red-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.paymentStatus === 'paid' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.id!, 'cancelled', 'cancelled')}
                              className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-200 text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                            >
                              Refund/Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
