'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  CalendarDays,
  BarChart3,
  ArrowLeftRight,
  Settings,
  LogOut,
  Users,
} from 'lucide-react';

const nav = [
  { href: '/guardia-admin',              label: 'Grilla mensual',   icon: CalendarDays },
  { href: '/guardia-admin/equidad',      label: 'Panel de equidad', icon: BarChart3 },
  { href: '/guardia-admin/canjes',       label: 'Canjes pendientes',icon: ArrowLeftRight },
  { href: '/guardia-admin/configuracion',label: 'Configuración',    icon: Settings },
];

export default function SidebarGuardiaAdmin() {
  const pathname = usePathname();
  const { usuario, logout } = useAuthStore();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-1">
          <Users size={20} className="text-indigo-400" />
          <span className="font-bold text-lg">Guardias</span>
        </div>
        <p className="text-xs text-gray-400">Panel supervisor</p>
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
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
