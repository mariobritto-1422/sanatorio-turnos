'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Calendar, Eye } from 'lucide-react';
import { BotonGigante } from '@/components/ui/BotonGigante';

export default function InicioPage() {
  const router = useRouter();
  const { isAuthenticated, usuario } = useAuthStore();

  useEffect(() => {
    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container-paciente">
        {/* Bienvenida */}
        <div className="text-center py-8 sm:py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Hola, {usuario?.paciente?.nombre}
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-600">
            ¿Qué querés hacer hoy?
          </p>
        </div>

        {/* Botones principales */}
        <div className="space-y-6 max-w-xl mx-auto">
          {/* Botón: Pedir Turno */}
          <BotonGigante
            icon={Calendar}
            variant="primary"
            onClick={() => router.push('/paciente/nuevo-turno')}
          >
            PEDIR TURNO
          </BotonGigante>

          {/* Botón: Ver Mis Turnos */}
          <BotonGigante
            icon={Eye}
            variant="secondary"
            onClick={() => router.push('/paciente/mis-turnos')}
          >
            VER MIS TURNOS
          </BotonGigante>
        </div>

        {/* Nota informativa */}
        <div className="mt-12 p-6 bg-primary-50 rounded-xl border-2 border-primary-200">
          <p className="text-xl text-center text-gray-700">
            Si tenés alguna duda, preguntale a recepción
          </p>
        </div>
      </div>
    </main>
  );
}
