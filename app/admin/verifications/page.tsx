'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllVerifications, updateVerificationStatus, ManagerVerification } from '@/services/managerService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function AdminVerificationsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState<ManagerVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (userData?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchVerifications();
  }, [user, userData, router]);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVerifications();
      // Sort pending first
      data.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0);
      });
      setVerifications(data);
    } catch (error) {
      toast.error('Failed to load verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await updateVerificationStatus(id, status, notes[id]);
      toast.success(`Verification ${status} successfully`);
      fetchVerifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  if (!user || userData?.role !== 'admin') return null;

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 border-b border-slate-900 pb-8 md:pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 tracking-tighter uppercase leading-none">
              Manager <span className="text-slate-400">Verifications</span>
            </h1>
            <p className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-500">
              Review and authorize platform access for hostel managers
            </p>
          </div>
          <Link href="/admin/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors">
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 border border-slate-100 animate-pulse bg-slate-50"></div>
            ))}
          </div>
        ) : verifications.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-slate-200">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">No pending applications found.</p>
          </div>
        ) : (
          <div className="grid gap-12">
            {verifications.map((v) => (
              <div key={v.id} className="border border-slate-900 group">
                <div className={`p-6 border-b border-slate-900 flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  v.status === 'pending' ? 'bg-yellow-50' : v.status === 'verified' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter text-slate-900">
                        {v.managerName || v.user?.displayName || 'Unknown Manager'}
                      </h3>
                      {(v.managerEmail || v.user?.email) && (
                        <a href={`mailto:${v.managerEmail || v.user?.email}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 px-3 py-1.5 transition-colors">
                          Email Manager
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-600">
                      <span>{v.managerEmail || v.user?.email || 'No email provided'}</span>
                      {v.user?.phoneNumber && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span>{v.user.phoneNumber}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                        App ID: {v.id?.slice(-8)}
                      </p>
                      <span className="text-slate-300 text-[10px]">•</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Submitted: {v.submittedAt?.toDate().toLocaleString() || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className={`inline-flex px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-slate-900 shrink-0 ${
                    v.status === 'pending' ? 'bg-white text-yellow-600' :
                    v.status === 'verified' ? 'bg-slate-900 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {v.status}
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-12 mb-12">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Identity Credentials</h4>
                      <div className="p-6 border border-slate-100 bg-slate-50 group-hover:border-slate-200 transition-colors">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">Government Issued ID</p>
                        <a 
                          href={v.idDocumentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Document <TrendingUp className="ml-2 w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Property Verification</h4>
                      <div className="p-6 border border-slate-100 bg-slate-50 group-hover:border-slate-200 transition-colors">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">Ownership Proof / License</p>
                        <a 
                          href={v.propertyProofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Document <TrendingUp className="ml-2 w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {v.status === 'pending' && (
                    <div className="space-y-8 border-t border-slate-100 pt-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Administrative Notes</Label>
                        <Textarea 
                          placeholder="Enter reason for rejection or internal authorization notes..."
                          value={notes[v.id!] || ''}
                          onChange={(e) => setNotes({...notes, [v.id!]: e.target.value})}
                          className="rounded-none border-slate-200 focus:border-slate-900 focus:ring-0 min-h-[120px] text-sm"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          onClick={() => handleStatusUpdate(v.id!, 'verified')}
                          className="flex-1 bg-slate-900 text-white rounded-none h-14 text-xs font-bold uppercase tracking-widest hover:bg-slate-800"
                        >
                          Authorize Manager
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(v.id!, 'rejected')}
                          variant="outline"
                          className="flex-1 border-red-600 text-red-600 rounded-none h-14 text-xs font-bold uppercase tracking-widest hover:bg-red-50 disabled:opacity-30"
                          disabled={!notes[v.id!]}
                        >
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {v.status !== 'pending' && v.adminNotes && (
                    <div className="mt-8 p-6 bg-slate-50 border-l-4 border-slate-900">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Admin Remarks:</p>
                      <p className="text-sm font-medium text-slate-700 italic">&quot;{v.adminNotes}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
