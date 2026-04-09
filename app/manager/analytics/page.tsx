'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getManagerAnalytics } from '@/services/analyticsService';
import { toast } from 'sonner';
import { ArrowLeft, DollarSign, TrendingUp, CreditCard, AlertCircle, Percent } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ManagerAnalytics() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData && userData.role !== 'manager') {
      router.push('/');
      return;
    }
    
    if (userData?.role === 'manager' && user?.uid) {
      fetchAnalytics(user.uid);
    }
  }, [userData, user, router]);

  const fetchAnalytics = async (uid: string) => {
    try {
      const analyticsData = await getManagerAnalytics(uid);
      setData(analyticsData);
    } catch (error: any) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => router.push('/manager/dashboard')} 
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors mb-6 md:mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
            Financial <br/> Analytics.
          </h1>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 max-w-xl">
            Track your property revenue, occupancy, and booking trends.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-slate-900 mb-16">
          <div className="p-8 border-r border-b border-slate-900 bg-slate-900 text-white">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Earned</h3>
            </div>
            <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter">
              GH₵{data.totalRevenue.toLocaleString()}
            </p>
          </div>
          
          <div className="p-8 border-r border-b border-slate-900 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-green-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Paid Out</h3>
            </div>
            <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter text-green-600">
              GH₵{data.totalPaid.toLocaleString()}
            </p>
          </div>

          <div className={`p-8 border-r border-b border-slate-900 ${data.pendingBalance > 0 ? 'bg-amber-50' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className={`w-5 h-5 ${data.pendingBalance > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              <h3 className={`text-[10px] font-bold uppercase tracking-widest ${data.pendingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Pending Balance</h3>
            </div>
            <p className={`text-4xl md:text-5xl font-heading font-bold tracking-tighter ${data.pendingBalance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              GH₵{data.pendingBalance.toLocaleString()}
            </p>
          </div>

          <div className="p-8 border-r border-b border-slate-900 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Percent className="w-5 h-5 text-blue-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Occupancy Rate</h3>
            </div>
            <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter text-blue-600">
              {data.occupancyRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Chart */}
          <div className="lg:col-span-7 border border-slate-900 p-6 md:p-8">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-8">Booking Trends</h3>
            <div className="h-[300px] w-full">
              {data.bookingTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 0, border: '1px solid #0f172a', boxShadow: 'none' }}
                      formatter={(value: number) => [value, 'Bookings']}
                    />
                    <Bar dataKey="bookings" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  No booking data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-5 border border-slate-900 flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-900 bg-slate-50">
              <h3 className="text-lg font-bold uppercase tracking-wider">Recent Transactions</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-h-[300px]">
              {data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold mb-1">{tx.studentEmail}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{tx.hostelName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+GH₵{tx.amount.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {tx.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="border border-slate-900">
          <div className="p-6 md:p-8 border-b border-slate-900 bg-slate-50">
            <h3 className="text-lg font-bold uppercase tracking-wider">Payout History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-50">
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Reference</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.payoutHistory.map((payout: any) => (
                  <tr key={payout.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4 md:p-6 text-sm font-bold">{payout.date.toLocaleDateString()}</td>
                    <td className="p-4 md:p-6 text-sm font-bold text-green-600">GH₵{payout.amount.toLocaleString()}</td>
                    <td className="p-4 md:p-6 text-sm text-slate-600">{payout.reference}</td>
                    <td className="p-4 md:p-6 text-sm text-slate-600">{payout.notes}</td>
                  </tr>
                ))}
                {data.payoutHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                      No payouts recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
