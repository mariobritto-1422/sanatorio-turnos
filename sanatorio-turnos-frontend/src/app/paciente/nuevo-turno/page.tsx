'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { TarjetaProfesional } from '@/components/ui/TarjetaProfesional';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function NuevoTurnoPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    cargarProfesionales();
  }, [isAuthenticated, router]);

  const cargarProfesionales = async () => {
    try {
      setCargando(true);
      const response = await api.getProfesionales(token!);

      if (response.success) {
        // Filtrar solo profesionales que aceptan nuevos pacientes
        const profesionalesActivos = response.data.filter(
          (p: any) => p.aceptaNuevosPacientes && p.estado === 'ACTIVO'
        );
        setProfesionales(profesionalesActivos);
      }
    } catch (err: any) {
      setError('No se pudieron cargar los profesionales');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarProfesional = (profesionalId: string) => {
    router.push(`/paciente/nuevo-turno/fecha?profesional=${profesionalId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header titulo="Elegir Profesional" mostrarVolver />

      <div className="container-paciente">
        {cargando ? (
          <Loading mensaje="Cargando profesionales..." />
        ) : error ? (
          <div className="p-6 bg-danger-50 border-2 border-danger-300 rounded-xl">
            <p className="text-xl text-danger-800 text-center font-semibold">
              {error}
            </p>
          </div>
        ) : profesionales.length === 0 ? (
          <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <p className="text-xl text-yellow-800 text-center font-semibold">
              No hay profesionales disponibles en este momento
            </p>
          </div>
        ) : (
          <>
            <p className="text-2xl text-gray-700 text-center mb-8">
              Seleccioná con quién querés tu turno
            </p>

            {/* Grilla de profesionales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {profesionales.map((profesional) => (
                <TarjetaProfesional
                  key={profesional.id}
                  profesional={profesional}
                  onClick={() => handleSeleccionarProfesional(profesional.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
