'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, linkWithCredential, PhoneAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '@/services/authService';
import { ArrowRight, Phone } from 'lucide-react';

export default function VerifyPhonePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (!loading && userData?.phoneVerified) {
      router.push('/');
    }
  }, [user, userData, loading, router]);

  // Initialize reCAPTCHA early so it has time to establish browser trust
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            toast.error('reCAPTCHA expired. Please try sending OTP again.');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = undefined;
            }
          }
        });
        
        // Optional pre-render to speed up SMS delivery
        window.recaptchaVerifier.render().catch(console.error);
      } catch (error) {
        console.error("Recaptcha initialization error", error);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch (e) {}
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error('Please enter a phone number');
    
    // Basic validation for Ghana numbers (+233)
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+233' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    setIsLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        throw new Error("Security verification not ready. Please refresh the page.");
      }
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('OTP');
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult || !user) return;

    setIsLoading(true);
    try {
      // 1. Verify the OTP
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
      
      // 2. Link the phone number to the current user account
      await linkWithCredential(user, credential);

      // 3. Update Firestore to mark phone as verified
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          phoneNumber: user.phoneNumber || phoneNumber,
          phoneVerified: true
        });
      } catch (dbError) {
        handleFirestoreError(dbError, OperationType.UPDATE, path);
      }

      toast.success('Phone number verified successfully!');
      
      // Redirect based on role
      if (userData?.role === 'manager') router.push('/manager/dashboard');
      else router.push('/');
      
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col md:flex-row">
      {/* Left Side - Branding/Image */}
      <div className="w-full md:w-1/2 bg-slate-50 p-8 md:p-16 lg:p-24 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-900">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest mb-12">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            Security Check
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold uppercase tracking-tighter leading-none mb-6">
            Verify <br/> Your <br/> Identity.
          </h1>
          <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
            To ensure the safety of our community, we require all users to verify their phone numbers before accessing the platform.
          </p>
        </div>
        
        <div className="mt-24 hidden md:block">
          <div className="w-full h-px bg-slate-200 mb-8"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Secure & Verified Properties Only
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <div className="w-16 h-16 border border-slate-900 rounded-full flex items-center justify-center mb-8">
              <Phone className="w-6 h-6 text-slate-900" />
            </div>
            <h2 className="text-2xl font-heading font-bold uppercase tracking-tighter mb-2">Phone Verification</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {step === 'PHONE' 
                ? 'Enter your phone number to receive a verification code.' 
                : `Enter the 6-digit code sent to ${phoneNumber}`}
            </p>
          </div>

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Phone Number</label>
                <input 
                  id="phone" 
                  type="tel" 
                  placeholder="+233 54 123 4567" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-3 text-lg font-medium outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300"
                  required
                />
              </div>
              <div id="recaptcha-container"></div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full group flex items-center justify-between bg-slate-900 text-white px-8 py-5 text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Verification Code</label>
                <input 
                  id="otp" 
                  type="text" 
                  placeholder="123456" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-3 text-3xl tracking-[0.5em] font-heading font-bold outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 text-center"
                  maxLength={6}
                  required
                />
              </div>
              
              <div className="pt-4 space-y-4">
                <button 
                  type="submit" 
                  className="w-full group flex items-center justify-between bg-slate-900 text-white px-8 py-5 text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                  {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
                
                <button 
                  type="button" 
                  className="w-full border border-slate-900 px-8 py-5 text-sm font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={() => setStep('PHONE')}
                  disabled={isLoading}
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
