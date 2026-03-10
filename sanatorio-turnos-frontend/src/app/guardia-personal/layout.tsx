'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import SidebarGuardiaPersonal from '@/components/guardias/SidebarGuardiaPersonal';

const ROLES_PERMITIDOS = ['ENFERMERO', 'MUCAMA', 'SUPERVISOR_GUARDIA', 'SUPERADMIN'];

export default function GuardiaPersonalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, usuario } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!ROLES_PERMITIDOS.includes(usuario?.rol || '')) { router.push('/login'); }
  }, [isAuthenticated, usuario, router]);

  if (!isAuthenticated || !ROLES_PERMITIDOS.includes(usuario?.rol || '')) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarGuardiaPersonal />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
