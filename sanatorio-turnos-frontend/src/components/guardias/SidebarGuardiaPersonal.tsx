'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { CalendarDays, Clock, ArrowLeftRight, LogOut } from 'lucide-react';

const nav = [
  { href: '/guardia-personal',               label: 'Mi grilla',       icon: CalendarDays },
  { href: '/guardia-personal/banco-horas',   label: 'Mi banco de horas', icon: Clock },
  { href: '/guardia-personal/canjes',        label: 'Canjes',           icon: ArrowLeftRight },
];

export default function SidebarGuardiaPersonal() {
  const pathname = usePathname();
  const { usuario, logout } = useAuthStore();

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <p className="font-bold text-lg">Mis guardias</p>
        <p className="text-xs text-gray-400 capitalize">{usuario?.rol?.toLowerCase()}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-3">{usuario?.email}</div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
