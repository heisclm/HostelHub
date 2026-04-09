'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAdminStats } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users, Home, CreditCard, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (userData?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load admin stats', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, userData, router]);

  if (!user || userData?.role !== 'admin') return null;

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 border-b border-slate-900 pb-8 md:pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 tracking-tighter uppercase leading-none">
              Admin <span className="text-slate-400">Dashboard</span>
            </h1>
            <p className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-500">
              Platform Overview & Management Control Center
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            System Live
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-slate-900">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 border-r border-b border-slate-900 animate-pulse bg-slate-50"></div>
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-16 md:space-y-24">
            {/* Primary Metrics Grid */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-slate-900">
                <div className="p-8 border-r border-b border-slate-900 group hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">01</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Users</p>
                  <h3 className="text-4xl font-heading font-bold text-slate-900 tracking-tighter">
                    {stats.users.total}
                  </h3>
                </div>

                <div className="p-8 border-r border-b border-slate-900 group hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">02</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Hostels</p>
                  <h3 className="text-4xl font-heading font-bold text-slate-900 tracking-tighter">
                    {stats.hostels.total}
                  </h3>
                </div>

                <div className="p-8 border-r border-b border-slate-900 group hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">03</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Bookings</p>
                  <h3 className="text-4xl font-heading font-bold text-slate-900 tracking-tighter">
                    {stats.bookings.total}
                  </h3>
                </div>

                <div className="p-8 border-r border-b border-slate-900 group hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">04</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Revenue</p>
                  <h3 className="text-4xl font-heading font-bold text-slate-900 tracking-tighter">
                    GH₵{stats.revenue.total.toLocaleString()}
                  </h3>
                </div>
              </div>
            </section>

            {/* Detailed Analytics Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl font-heading font-bold text-slate-900 uppercase tracking-tight">Platform Analytics</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-slate-900">
                <div className="p-8 border-r border-b border-slate-900">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">User Segments</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Students</span>
                      <span className="text-2xl font-heading font-bold text-slate-900">{stats.users.students}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100">
                      <div 
                        className="h-full bg-slate-900" 
                        style={{ width: `${(stats.users.students / stats.users.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Managers</span>
                      <span className="text-2xl font-heading font-bold text-slate-900">{stats.users.managers}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100">
                      <div 
                        className="h-full bg-slate-400" 
                        style={{ width: `${(stats.users.managers / stats.users.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-r border-b border-slate-900">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Hostel Verification</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Verified</span>
                      <span className="text-2xl font-heading font-bold text-green-600">{stats.hostels.verified}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${(stats.hostels.verified / stats.hostels.total || 0) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Pending</span>
                      <span className="text-2xl font-heading font-bold text-yellow-600">
                        {stats.hostels.total - stats.hostels.verified}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-100">
                      <div 
                        className="h-full bg-yellow-500" 
                        style={{ width: `${((stats.hostels.total - stats.hostels.verified) / stats.hostels.total || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-r border-b border-slate-900">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Booking Conversion</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Confirmed</span>
                      <span className="text-2xl font-heading font-bold text-slate-900">{stats.bookings.confirmed}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100">
                      <div 
                        className="h-full bg-slate-900" 
                        style={{ width: `${(stats.bookings.confirmed / stats.bookings.total || 0) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Pending</span>
                      <span className="text-2xl font-heading font-bold text-slate-400">
                        {stats.bookings.total - stats.bookings.confirmed}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-100">
                      <div 
                        className="h-full bg-slate-200" 
                        style={{ width: `${((stats.bookings.total - stats.bookings.confirmed) / stats.bookings.total || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl font-heading font-bold text-slate-900 uppercase tracking-tight">Administrative Actions</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Link href="/admin/verifications" className="group">
                  <div className="p-8 border border-slate-900 group-hover:bg-slate-900 transition-all duration-300">
                    <h3 className="text-lg font-heading font-bold text-slate-900 group-hover:text-white uppercase tracking-tight mb-2">
                      Manager Verifications
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 mb-8">
                      Review and authorize hostel manager applications and property credentials.
                    </p>
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-900 group-hover:text-white">
                      Access Module <TrendingUp className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </Link>

                <Link href="/admin/hostels" className="group">
                  <div className="p-8 border border-slate-900 group-hover:bg-slate-900 transition-all duration-300">
                    <h3 className="text-lg font-heading font-bold text-slate-900 group-hover:text-white uppercase tracking-tight mb-2">
                      Hostel Verifications
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 mb-8">
                      Review and authorize individual hostel listings for platform visibility.
                    </p>
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-900 group-hover:text-white">
                      Access Module <TrendingUp className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </Link>

                <Link href="/admin/complaints" className="group">
                  <div className="p-8 border border-slate-900 group-hover:bg-slate-900 transition-all duration-300 h-full">
                    <h3 className="text-lg font-heading font-bold text-slate-900 group-hover:text-white uppercase tracking-tight mb-2">
                      System Complaints
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 mb-8">
                      Monitor, override, and manage all complaints across the platform.
                    </p>
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-900 group-hover:text-white">
                      Access Module <TrendingUp className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </Link>

                <Link href="/admin/analytics" className="group">
                  <div className="p-8 border border-slate-900 group-hover:bg-slate-900 transition-all duration-300 h-full">
                    <h3 className="text-lg font-heading font-bold text-slate-900 group-hover:text-white uppercase tracking-tight mb-2">
                      Revenue Analytics
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 mb-8">
                      View global financial overview, manager performance, and booking trends.
                    </p>
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-900 group-hover:text-white">
                      Access Module <TrendingUp className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </Link>

                <Link href="/admin/payouts" className="group">
                  <div className="p-8 border border-slate-900 group-hover:bg-slate-900 transition-all duration-300 h-full">
                    <h3 className="text-lg font-heading font-bold text-slate-900 group-hover:text-white uppercase tracking-tight mb-2">
                      Financial Payouts
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 mb-8">
                      Manage manager balances and record bank payouts.
                    </p>
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-900 group-hover:text-white">
                      Access Module <TrendingUp className="ml-2 w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
