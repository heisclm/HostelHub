'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { submitVerification } from '@/services/managerService';
import { useManagerVerification } from '@/hooks/useDashboard';
import { toast } from 'sonner';

export default function ManagerVerifyPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { verificationStatus, isLoading: isStatusLoading, mutate: mutateVerification } = useManagerVerification(user?.uid);
  
  const [isLoading, setIsLoading] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [propFile, setPropFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (userData?.role !== 'manager') {
      router.push('/');
      return;
    }
  }, [user, userData, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!idFile || !propFile) {
      toast.error('Please select both documents');
      return;
    }

    setIsLoading(true);
    try {
      await submitVerification(user.uid, user.displayName || undefined, user.email || undefined, idFile, propFile);
      toast.success('Verification documents submitted successfully!');
      mutateVerification();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit verification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || userData?.role !== 'manager') return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
            Manager <br/> Verification.
          </h1>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 max-w-xl">
            To list and manage hostels on HostelHub, we need to verify your identity and property ownership.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="border border-slate-900 p-6 md:p-12 bg-white">
          {verificationStatus ? (
            <div className="mb-10 md:mb-12 border-b border-slate-900 pb-10 md:pb-12">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Current Status</h3>
              <div className="flex items-center gap-4 mb-6">
                <span className={`px-3 py-1.5 md:px-4 md:py-2 text-[10px] font-bold uppercase tracking-widest border ${
                  verificationStatus.status === 'pending' ? 'bg-amber-50 border-amber-500 text-amber-600' :
                  verificationStatus.status === 'verified' ? 'bg-green-50 border-green-500 text-green-600' :
                  'bg-red-50 border-red-500 text-red-600'
                }`}>
                  {verificationStatus.status}
                </span>
              </div>
              
              {verificationStatus.status === 'pending' && (
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Your documents are currently under review by our admin team. We will notify you once the review is complete.</p>
              )}
              
              {verificationStatus.status === 'verified' && (
                <div className="space-y-6">
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">Your account has been verified! You can now manage your hostels.</p>
                  <button 
                    onClick={() => router.push('/manager/dashboard')} 
                    className="w-full sm:w-auto inline-block border border-slate-900 px-6 py-3 md:px-8 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}

              {verificationStatus.status === 'rejected' && (
                <div className="space-y-6">
                  <p className="text-xs md:text-sm text-red-600 font-bold uppercase tracking-widest">Your verification was rejected.</p>
                  {verificationStatus.adminNotes && (
                    <div className="border border-slate-200 p-4 bg-slate-50">
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Reason</p>
                      <p className="text-xs md:text-sm text-slate-700">{verificationStatus.adminNotes}</p>
                    </div>
                  )}
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Please submit new documents below.</p>
                </div>
              )}
            </div>
          ) : null}

          {(!verificationStatus || verificationStatus.status === 'rejected') && (
            <div>
              <h2 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter mb-8">Submit Documents</h2>
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                <div className="space-y-3 md:space-y-4">
                  <label htmlFor="idDocument" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Government Issued ID</label>
                  <p className="text-[10px] text-slate-400">Passport, National ID, or Driver&apos;s License (Image or PDF)</p>
                  <div className="border border-dashed border-slate-400 p-6 md:p-8 text-center hover:bg-slate-50 transition-colors">
                    <input 
                      id="idDocument" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                    <label htmlFor="idDocument" className="cursor-pointer flex flex-col items-center justify-center">
                      <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest border-b border-slate-900 pb-1 mb-2">Choose File</span>
                      {idFile ? (
                        <span className="text-[10px] text-slate-900 font-bold">{idFile.name}</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">or drag and drop</span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <label htmlFor="propertyProof" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Proof of Property Ownership</label>
                  <p className="text-[10px] text-slate-400">Utility bill, property deed, or official management agreement (Image or PDF)</p>
                  <div className="border border-dashed border-slate-400 p-6 md:p-8 text-center hover:bg-slate-50 transition-colors">
                    <input 
                      id="propertyProof" 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => setPropFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                    <label htmlFor="propertyProof" className="cursor-pointer flex flex-col items-center justify-center">
                      <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest border-b border-slate-900 pb-1 mb-2">Choose File</span>
                      {propFile ? (
                        <span className="text-[10px] text-slate-900 font-bold">{propFile.name}</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">or drag and drop</span>
                      )}
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white py-4 md:py-5 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-8" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading Documents...' : 'Submit for Verification'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

