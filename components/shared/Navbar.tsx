'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/services/authService';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NotificationBell from '@/components/NotificationBell';

export function Navbar() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      router.push('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Hostels', href: '/hostels' },
    { name: 'Contact', href: '/contact' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-900">
      <div className="w-full flex h-20 items-center justify-between px-4 md:px-6 lg:px-12">
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <span className="text-white font-heading font-bold text-lg leading-none">H</span>
            </div>
            <span className="text-lg md:text-xl font-heading font-bold text-slate-900 tracking-tighter uppercase">HostelHub.</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-500">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`transition-colors hover:text-slate-900 ${pathname === link.href ? 'text-slate-900' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-6">
          {!loading && (
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {user ? (
                <div className="flex items-center gap-4 lg:gap-6">
                  <button 
                    onClick={() => {
                      if (userData?.role === 'admin') {
                        router.push('/admin/dashboard');
                      } else if (userData?.role === 'manager') {
                        router.push('/manager/dashboard');
                      } else {
                        router.push('/student/dashboard');
                      }
                    }} 
                    className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors whitespace-nowrap"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors whitespace-nowrap"
                  >
                    Logout
                  </button>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-900 leading-none">
                      {userData?.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[8px] lg:text-[10px] uppercase tracking-widest text-slate-400 mt-1">{userData?.role}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 lg:gap-6">
                  <Link href="/login" className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-slate-500 transition-colors whitespace-nowrap">
                    Sign In
                  </Link>
                  <Link href="/register" className="text-[10px] lg:text-xs font-bold uppercase tracking-widest bg-slate-900 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-full hover:bg-slate-800 transition-colors whitespace-nowrap">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button 
              className="w-10 h-10 flex items-center justify-center text-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {user && (
            <div className="hidden md:block">
              <NotificationBell />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-slate-900 bg-white overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-6">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between text-sm font-bold uppercase tracking-widest py-2 border-b border-slate-100 ${pathname === link.href ? 'text-slate-900' : 'text-slate-500'}`}
                  >
                    {link.name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </nav>

              {!loading && (
                <div className="pt-4 space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-900">
                            {userData?.displayName || user.email?.split('@')[0]}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-slate-400">{userData?.role}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              if (userData?.role === 'admin') {
                                router.push('/admin/dashboard');
                              } else if (userData?.role === 'manager') {
                                router.push('/manager/dashboard');
                              } else {
                                router.push('/student/dashboard');
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2"
                          >
                            Dashboard
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-center text-xs font-bold uppercase tracking-widest text-red-600 py-4 border border-red-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Link 
                        href="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-900 border border-slate-900 py-4"
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/register" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center text-xs font-bold uppercase tracking-widest bg-slate-900 text-white py-4"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
