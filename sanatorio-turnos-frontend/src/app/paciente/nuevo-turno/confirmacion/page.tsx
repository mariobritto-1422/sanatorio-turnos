'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Home } from 'lucide-react';
import { BotonGigante } from '@/components/ui/BotonGigante';

export default function ConfirmacionPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirigir después de 10 segundos
    const timer = setTimeout(() => {
      router.push('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-success-50 to-white flex items-center justify-center">
      <div className="container-paciente max-w-2xl">
        <div className="text-center animate-pulse-success">
          {/* Ícono de éxito gigante */}
          <div className="flex justify-center mb-8">
            <div className="bg-success-500 rounded-full p-8">
              <CheckCircle2
                size={120}
                className="text-white"
                strokeWidth={3}
              />
            </div>
          </div>

          {/* Mensaje de éxito */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            ¡Turno Confirmado!
          </h1>

          <p className="text-2xl sm:text-3xl text-gray-700 mb-4">
            Tu turno fue creado con éxito
          </p>

          <div className="p-6 bg-success-100 border-3 border-success-300 rounded-2xl mb-8">
            <p className="text-xl font-semibold text-success-800">
              ✓ Recordá llegar 10 minutos antes
            </p>
            <p className="text-xl font-semibold text-success-800 mt-2">
              ✓ Traé tu documento y obra social
            </p>
          </div>

          {/* Botón volver al inicio */}
          <BotonGigante
            icon={Home}
            variant="primary"
            onClick={() => router.push('/')}
          >
            VOLVER AL INICIO
          </BotonGigante>

          <p className="mt-6 text-lg text-gray-600">
            Te redirigiremos automáticamente en unos segundos...
          </p>
        </div>
      </div>
    </main>
  );
}
