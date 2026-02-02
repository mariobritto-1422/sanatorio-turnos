'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Building2,
  Settings,
  LogOut,
  ClipboardList,
  BarChart3,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/recepcion/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Gestión de Turnos',
    href: '/recepcion/turnos',
    icon: Calendar,
  },
  {
    name: 'Estadísticas',
    href: '/recepcion/estadisticas',
    icon: BarChart3,
  },
  {
    name: 'Pacientes',
    href: '/recepcion/pacientes',
    icon: Users,
  },
  {
    name: 'Profesionales',
    href: '/recepcion/profesionales',
    icon: Stethoscope,
  },
  {
    name: 'Obras Sociales',
    href: '/recepcion/obras-sociales',
    icon: Building2,
  },
  {
    name: 'Notificaciones',
    href: '/recepcion/notificaciones',
    icon: Bell,
  },
  {
    name: 'Configuración',
    href: '/recepcion/configuracion',
    icon: Settings,
  },
];

export function SidebarRecepcion() {
  const pathname = usePathname();
  const { usuario, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <ClipboardList size={24} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Sanatorio</h2>
            <p className="text-sm text-gray-500">Panel Administrativo</p>
          </div>
        </div>
        {usuario && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{usuario.email}</p>
            <p className="text-xs text-gray-500">
              {usuario.rol === 'SUPERADMIN' ? 'SuperAdmin' : 'Recepción'}
            </p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg
                     text-danger-600 hover:bg-danger-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
