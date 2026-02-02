'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { TarjetaTurnoProfesional } from '@/components/profesional/TarjetaTurnoProfesional';
import { FichaPaciente } from '@/components/profesional/FichaPaciente';
import { Calendar, Clock, Users, AlertCircle, Plus } from 'lucide-react';
import { format, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardProfesionalPage() {
  const { token, usuario } = useAuthStore();
  const [turnosHoy, setTurnosHoy] = useState<any[]>([]);
  const [turnosSemana, setTurnosSemana] = useState<any[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    cargarDatos();
  }, [fecha]);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const profesionalId = usuario?.profesional?.id;
      if (!profesionalId) return;

      // Turnos de hoy
      const hoy = format(fecha, 'yyyy-MM-dd');
      const responseHoy = await api.getTurnos(
        {
          profesionalId,
          desde: `${hoy}T00:00:00`,
          hasta: `${hoy}T23:59:59`,
        },
        token!
      );

      // Turnos de la semana
      const inicioSemana = format(startOfWeek(fecha, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const finSemana = format(endOfWeek(fecha, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const responseSemana = await api.getTurnos(
        {
          profesionalId,
          desde: `${inicioSemana}T00:00:00`,
          hasta: `${finSemana}T23:59:59`,
        },
        token!
      );

      if (responseHoy.success) {
        const turnosOrdenados = responseHoy.data.sort(
          (a: any, b: any) =>
            new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
        );
        setTurnosHoy(turnosOrdenados);
      }

      if (responseSemana.success) {
        setTurnosSemana(responseSemana.data);
      }
    } catch (err) {
      console.error('Error al cargar turnos:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleClickTurno = async (turno: any) => {
    // Cargar datos completos del paciente
    try {
      // Aquí deberías tener un endpoint para obtener el paciente completo
      // Por ahora usamos los datos del turno
      setPacienteSeleccionado(turno.paciente);
      setMostrarFicha(true);
    } catch (err) {
      console.error('Error al cargar paciente:', err);
    }
  };

  const turnosPendientes = turnosHoy.filter(
    (t) => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'
  );
  const turnosCompletados = turnosHoy.filter((t) => t.estado === 'COMPLETADO');

  if (cargando) {
    return (
      <div className="p-8">
        <Loading mensaje="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, Dr./Dra. {usuario?.profesional?.apellido}
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnos Hoy</p>
              <p className="text-3xl font-bold text-gray-900">{turnosHoy.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar size={24} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">
                {turnosPendientes.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-3xl font-bold text-green-600">
                {turnosCompletados.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-3xl font-bold text-gray-900">
                {turnosSemana.length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Calendar size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setFecha(addDays(fecha, -1))}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg
                     hover:bg-gray-50 transition-colors"
        >
          ← Día Anterior
        </button>
        <div className="flex-1 text-center">
          <p className="text-xl font-bold text-gray-900">
            {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <button
          onClick={() => setFecha(addDays(fecha, 1))}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg
                     hover:bg-gray-50 transition-colors"
        >
          Día Siguiente →
        </button>
        <button
          onClick={() => setFecha(new Date())}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg
                     hover:bg-primary-600 transition-colors font-medium"
        >
          Hoy
        </button>
      </div>

      {/* Agenda del Día */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Agenda del Día</h2>

        {turnosHoy.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay turnos para este día</p>
          </div>
        ) : (
          <div className="space-y-3">
            {turnosHoy.map((turno) => (
              <TarjetaTurnoProfesional
                key={turno.id}
                turno={turno}
                onClick={() => handleClickTurno(turno)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ficha de Paciente Modal */}
      {mostrarFicha && pacienteSeleccionado && (
        <FichaPaciente
          paciente={pacienteSeleccionado}
          onClose={() => setMostrarFicha(false)}
        />
      )}
    </div>
  );
}
