'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { TarjetaTurno } from '@/components/ui/TarjetaTurno';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function MisTurnosPage() {
  const router = useRouter();
  const { token, isAuthenticated, usuario } = useAuthStore();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    cargarTurnos();
  }, [isAuthenticated, router]);

  const cargarTurnos = async () => {
    try {
      setCargando(true);
      const response = await api.getTurnos(
        {
          pacienteId: usuario?.paciente?.id,
        },
        token!
      );

      if (response.success) {
        // Ordenar por fecha descendente (más recientes primero)
        const turnosOrdenados = response.data.sort(
          (a: any, b: any) =>
            new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );
        setTurnos(turnosOrdenados);
      }
    } catch (err: any) {
      setError('No se pudieron cargar los turnos');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelarTurno = async (turnoId: string) => {
    const confirmar = window.confirm(
      '¿Estás seguro que querés cancelar este turno?'
    );

    if (!confirmar) return;

    try {
      setCargando(true);
      await api.cancelarTurno(
        turnoId,
        'Cancelado por el paciente desde la app',
        token!
      );

      // Recargar turnos
      await cargarTurnos();

      alert('Turno cancelado correctamente');
    } catch (err: any) {
      alert('No se pudo cancelar el turno');
    } finally {
      setCargando(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header titulo="Mis Turnos" mostrarVolver />

      <div className="container-paciente">
        {cargando ? (
          <Loading mensaje="Cargando turnos..." />
        ) : error ? (
          <div className="p-6 bg-danger-50 border-2 border-danger-300 rounded-xl">
            <p className="text-xl text-danger-800 text-center font-semibold">
              {error}
            </p>
          </div>
        ) : turnos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-600 mb-8">
              No tenés turnos programados
            </p>
            <button
              onClick={() => router.push('/paciente/nuevo-turno')}
              className="text-xl font-semibold text-primary-600 hover:text-primary-700
                         underline"
            >
              Pedí tu primer turno
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {turnos.map((turno) => (
              <TarjetaTurno
                key={turno.id}
                turno={turno}
                onCancelar={() => handleCancelarTurno(turno.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
