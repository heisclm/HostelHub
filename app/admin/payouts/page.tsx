'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getManagerBalances, recordPayout } from '@/services/payoutService';
import { toast } from 'sonner';
import { ArrowLeft, DollarSign, ArrowRight, X } from 'lucide-react';

export default function AdminPayouts() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [balances, setBalances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (userData?.role === 'admin') {
      fetchBalances();
    }
  }, [userData, router]);

  const fetchBalances = async () => {
    try {
      const data = await getManagerBalances();
      setBalances(data);
    } catch (error: any) {
      toast.error('Failed to load payout data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (manager: any) => {
    setSelectedManager(manager);
    setPayoutAmount(manager.pendingBalance.toString());
    setPayoutReference('');
    setPayoutNotes('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedManager(null);
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > selectedManager.pendingBalance) {
      toast.error('Amount cannot exceed pending balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayout({
        managerId: selectedManager.managerId,
        amount,
        reference: payoutReference,
        notes: payoutNotes
      });
      
      toast.success('Payout recorded successfully');
      handleCloseModal();
      fetchBalances(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalPending = balances.reduce((sum, m) => sum + m.pendingBalance, 0);

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24 relative">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => router.push('/admin/dashboard')} 
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors mb-6 md:mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
                Financial <br/> Payouts.
              </h1>
              <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 max-w-xl">
                Manage and record payments to hostel managers.
              </p>
            </div>
            <div className="p-6 md:p-8 border border-slate-900 bg-slate-900 text-white min-w-[250px]">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Pending Payouts</h3>
              </div>
              <p className="text-3xl md:text-4xl font-heading font-bold tracking-tighter text-amber-500">
                GH₵{totalPending.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        
        {/* Managers Table */}
        <div className="border border-slate-900">
          <div className="p-6 md:p-8 border-b border-slate-900 bg-slate-50">
            <h3 className="text-lg font-bold uppercase tracking-wider">Manager Balances</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-50">
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Manager</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Earned</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Paid</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Pending Balance</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Last Payout</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((manager: any) => (
                  <tr key={manager.managerId} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4 md:p-6">
                      <p className="text-sm font-bold">{manager.managerName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{manager.managerEmail}</p>
                    </td>
                    <td className="p-4 md:p-6 text-sm text-slate-600">GH₵{manager.totalEarned.toLocaleString()}</td>
                    <td className="p-4 md:p-6 text-sm text-green-600 font-bold">GH₵{manager.totalPaid.toLocaleString()}</td>
                    <td className="p-4 md:p-6">
                      <span className={`text-sm font-bold ${manager.pendingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        GH₵{manager.pendingBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-xs text-slate-500">
                      {manager.lastPayout ? manager.lastPayout.toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <button
                        onClick={() => handleOpenModal(manager)}
                        disabled={manager.pendingBalance <= 0}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Record Payout
                      </button>
                    </td>
                  </tr>
                ))}
                {balances.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                      No manager data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payout Modal */}
      {isModalOpen && selectedManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-900 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-900">
              <h3 className="text-xl font-heading font-bold uppercase tracking-tighter">Record Payout</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPayout} className="p-6 space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Paying To</p>
                <p className="text-sm font-bold">{selectedManager.managerName}</p>
                <p className="text-[10px] text-slate-500">{selectedManager.managerEmail}</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Pending Balance</p>
                <p className="text-2xl font-heading font-bold text-amber-700">GH₵{selectedManager.pendingBalance.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Amount to Pay (GH₵)</label>
                <input 
                  type="number" 
                  step="0.01"
                  max={selectedManager.pendingBalance}
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-3 text-lg font-medium outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Bank Reference / Transaction ID (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. TRN-123456789"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-3 text-base font-medium outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Notes (Optional)</label>
                <textarea 
                  placeholder="Any additional notes..."
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-3 text-base font-medium outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 rounded-none resize-none h-24"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-slate-900 text-slate-900 px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 group flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Payout'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
