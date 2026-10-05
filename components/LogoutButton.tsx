'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';

export default function LogoutButton({
  className = '',
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (!window.confirm('Apakah Anda yakin ingin keluar dari akun ini?')) {
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      await signOut(auth);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.warn('[Logout] Notice:', err);
      router.push('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ||
        'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 hover:text-red-800 text-xs font-semibold transition cursor-pointer shadow-2xs'
      }
      title="Keluar dari akun Anda"
    >
      <LogOut className="w-3.5 h-3.5" />
      {showLabel && <span>{loading ? 'Keluar...' : 'Keluar Akun'}</span>}
    </button>
  );
}
