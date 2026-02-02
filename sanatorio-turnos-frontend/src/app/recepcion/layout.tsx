'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { SidebarRecepcion } from '@/components/recepcion/SidebarRecepcion';

export default function RecepcionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, usuario } = useAuthStore();

  useEffect(() => {
    if (
      !isAuthenticated ||
      (usuario?.rol !== 'RECEPCION' && usuario?.rol !== 'SUPERADMIN')
    ) {
      router.push('/login');
    }
  }, [isAuthenticated, usuario, router]);

  if (
    !isAuthenticated ||
    (usuario?.rol !== 'RECEPCION' && usuario?.rol !== 'SUPERADMIN')
  ) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarRecepcion />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
