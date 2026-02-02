'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/profesional/Sidebar';

export default function ProfesionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, usuario } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || usuario?.rol !== 'PROFESIONAL') {
      router.push('/login');
    }
  }, [isAuthenticated, usuario, router]);

  if (!isAuthenticated || usuario?.rol !== 'PROFESIONAL') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
