'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStudentDashboard } from '@/hooks/useDashboard';
import { Booking, Hostel, Complaint } from '@/types';
import Link from 'next/link';
import { MapPin, Calendar, CreditCard, Phone, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import PhoneVerification from '@/components/PhoneVerification';

type BookingWithHostel = Booking & { hostel?: Hostel };

const PaystackButton = dynamic(() => import('@/components/PaystackButton'), { ssr: false });

export default function StudentDashboard() {
  const { user, userData } = useAuth();
  const { bookings, complaints, isLoading, mutateBookings } = useStudentDashboard(user?.uid);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'complaints'>('bookings');

  if (!user) return null;

  const paidBookings = (bookings as BookingWithHostel[]).filter(b => b.paymentStatus === 'paid');

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-slate-900 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-900"></span>
              Student Portal
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-none">
              Dashboard.
            </h1>
            <p className="text-slate-500 font-medium text-base md:text-lg max-w-md">
              Welcome back, {user.displayName || user.email}. Manage your bookings, payments, and communications.
            </p>
          </div>
          
          {!userData?.phoneVerified && (
            <button 
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors uppercase tracking-widest text-[10px] md:text-xs font-bold px-6 py-4 md:px-8"
              onClick={() => setShowPhoneVerification(!showPhoneVerification)}
            >
              <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Verify Phone Number
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {showPhoneVerification && !userData?.phoneVerified && (
          <div className="mb-12 md:mb-16 max-w-md border border-slate-900 p-6 md:p-8 bg-slate-50">
            <PhoneVerification onVerified={() => setShowPhoneVerification(false)} />
          </div>
        )}

        {/* Tabs - Scrollable on mobile */}
        <div className="flex gap-6 md:gap-8 mb-8 md:mb-12 border-b border-slate-200 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 font-bold uppercase tracking-widest text-[10px] md:text-sm whitespace-nowrap transition-colors relative ${activeTab === 'bookings' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            My Bookings
            {activeTab === 'bookings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`pb-4 font-bold uppercase tracking-widest text-[10px] md:text-sm whitespace-nowrap transition-colors relative ${activeTab === 'payments' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Payment History
            {activeTab === 'payments' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`pb-4 font-bold uppercase tracking-widest text-[10px] md:text-sm whitespace-nowrap transition-colors relative ${activeTab === 'complaints' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Complaints & Maintenance
            {activeTab === 'complaints' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></span>}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 md:py-24">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="min-h-[300px] md:min-h-[400px]">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 md:space-y-8">
                {bookings.length === 0 ? (
                  <div className="text-center py-16 md:py-24 border border-dashed border-slate-300 bg-slate-50">
                    <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-2">No Bookings Yet</h3>
                    <p className="text-slate-500 mb-6 md:mb-8 text-xs md:text-sm">You haven&apos;t made any hostel bookings.</p>
                    <Link href="/hostels" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 md:px-8 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                      Find a Hostel <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-slate-900 flex flex-col group hover:bg-slate-50 transition-colors bg-white">
                        <div className="p-6 md:p-8 border-b border-slate-900 flex justify-between items-start gap-4">
                          <div>
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 border border-slate-900 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-3 md:mb-4">
                              {booking.status}
                            </div>
                            <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-1 md:mb-2 line-clamp-1">{booking.hostel?.name || 'Unknown Hostel'}</h3>
                            <p className="text-slate-500 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> {booking.hostel?.address}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 md:mb-1">Room</p>
                            <p className="text-xl md:text-2xl font-heading font-bold tracking-tighter">{booking.roomNumber || booking.roomId}</p>
                          </div>
                        </div>
                        
                        <div className="p-6 md:p-8 grid grid-cols-2 gap-6 md:gap-8 flex-1">
                          <div>
                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 md:mb-2">Semester</p>
                            <p className="text-sm md:text-base font-bold">{booking.semester}</p>
                          </div>
                          <div>
                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 md:mb-2">Amount</p>
                            <p className="text-sm md:text-base font-bold">GH₵{booking.amount}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 md:mb-2">Payment Status</p>
                            <div className="flex items-center gap-2">
                              {booking.paymentStatus === 'paid' ? (
                                <span className="flex items-center text-green-600 font-bold text-[10px] md:text-xs uppercase tracking-wider">
                                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" /> Paid
                                </span>
                              ) : (
                                <span className="flex items-center text-amber-600 font-bold text-[10px] md:text-xs uppercase tracking-wider">
                                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" /> Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {booking.paymentStatus === 'pending' && booking.status === 'approved' && (
                          <div className="p-6 md:p-8 border-t border-slate-900 bg-slate-50">
                            <PaystackButton 
                              booking={booking} 
                              user={user} 
                              onSuccess={() => {
                                // Refresh bookings using SWR mutate
                                mutateBookings();
                              }} 
                            />
                          </div>
                        )}
                        
                        {booking.paymentStatus === 'pending' && booking.status === 'pending' && (
                          <div className="p-6 md:p-8 border-t border-slate-900 bg-amber-50">
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                              Waiting for manager approval before payment can be made.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6 md:space-y-8">
                {paidBookings.length === 0 ? (
                  <div className="text-center py-16 md:py-24 border border-dashed border-slate-300 bg-slate-50">
                    <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-2">No Payments</h3>
                    <p className="text-slate-500 text-xs md:text-sm">You haven&apos;t made any payments yet.</p>
                  </div>
                ) : (
                  <div className="border border-slate-900 overflow-x-auto -mx-4 md:mx-0">
                    <div className="min-w-[600px] md:min-w-full">
                      <div className="grid grid-cols-4 gap-4 p-4 md:p-6 border-b border-slate-900 bg-slate-50 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <div>Date</div>
                        <div>Hostel</div>
                        <div>Reference</div>
                        <div className="text-right">Amount</div>
                      </div>
                      <div className="divide-y divide-slate-200">
                        {paidBookings.map((booking) => (
                          <div key={booking.id} className="grid grid-cols-4 gap-4 p-4 md:p-6 items-center hover:bg-slate-50 transition-colors bg-white">
                            <div className="text-xs md:text-sm font-medium">
                              {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-xs md:text-sm font-bold uppercase tracking-wider truncate">
                              {booking.hostel?.name || 'Unknown'}
                            </div>
                            <div className="text-[10px] md:text-xs font-mono text-slate-500 truncate">
                              {booking.paymentReference || 'N/A'}
                            </div>
                            <div className="text-right font-bold text-xs md:text-sm">
                              GH₵{booking.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 md:pb-8 gap-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-tighter">My Complaints</h2>
                  <Link href="/student/complaints" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                    File New Complaint
                  </Link>
                </div>

                {complaints.length === 0 ? (
                  <div className="text-center py-16 md:py-24 border border-dashed border-slate-300 bg-slate-50">
                    <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest">You haven&apos;t filed any complaints.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border border-slate-900 p-6 md:p-8 hover:bg-slate-50 transition-colors bg-white">
                        <div className="flex justify-between items-start mb-4 md:mb-6 gap-4">
                          <h3 className="text-lg md:text-xl font-heading font-bold uppercase tracking-tighter line-clamp-1">{complaint.title}</h3>
                          <div className={`px-2 py-0.5 md:px-3 md:py-1 border text-[8px] md:text-[10px] font-bold uppercase tracking-widest shrink-0 ${
                            complaint.status === 'resolved' ? 'border-green-600 text-green-600 bg-green-50' :
                            complaint.status === 'in-progress' ? 'border-blue-600 text-blue-600 bg-blue-50' :
                            'border-amber-600 text-amber-600 bg-amber-50'
                          }`}>
                            {complaint.status}
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs md:text-sm mb-6 md:mb-8 line-clamp-3 leading-relaxed">{complaint.description}</p>
                        <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Filed on: {complaint.createdAt?.toDate ? complaint.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
