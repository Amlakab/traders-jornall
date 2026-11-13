'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (isAdmin) {
          router.replace('/users');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, isAdmin, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-xs text-slate-500 font-mono">Initializing TradeX Journal...</p>
    </div>
  );
}
