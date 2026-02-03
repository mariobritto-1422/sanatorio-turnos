'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { Calendar, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRInstalacion } from '@/components/recepcion/QRInstalacion';

export default function DashboardRecepcionPage() {
  const { token } = useAuthStore();
  const [estadisticas, setEstadisticas] = useState({
    turnosHoy: 0,
    pendientes: 0,
    completados: 0,
    cancelados: 0,
    totalPacientes: 0,
    totalProfesionales: 0,
  });
  const [turnosRecientes, setTurnosRecientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // Turnos de hoy
      const hoy = format(new Date(), 'yyyy-MM-dd');
      const responseTurnos = await api.getTurnos(
        {
          desde: `${hoy}T00:00:00`,
          hasta: `${hoy}T23:59:59`,
        },
        token!
      );

      // Pacientes
      const responsePacientes = await api.getAll('/pacientes', token!);

      // Profesionales
      const responseProfesionales = await api.getProfesionales(token!);

      if (responseTurnos.success) {
        const turnos = responseTurnos.data;
        setTurnosRecientes(turnos.slice(0, 10));
        setEstadisticas((prev) => ({
          ...prev,
          turnosHoy: turnos.length,
          pendientes: turnos.filter(
            (t: any) => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO'
          ).length,
          completados: turnos.filter((t: any) => t.estado === 'COMPLETADO')
            .length,
          cancelados: turnos.filter(
            (t: any) =>
              t.estado === 'CANCELADO_PACIENTE' ||
              t.estado === 'CANCELADO_PROFESIONAL'
          ).length,
        }));
      }

      if (responsePacientes.success) {
        setEstadisticas((prev) => ({
          ...prev,
          totalPacientes: responsePacientes.data.length,
        }));
      }

      if (responseProfesionales.success) {
        setEstadisticas((prev) => ({
          ...prev,
          totalProfesionales: responseProfesionales.data.length,
        }));
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setCargando(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel Administrativo
        </h1>
        <p className="text-gray-600">
          {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnos Hoy</p>
              <p className="text-3xl font-bold text-gray-900">
                {estadisticas.turnosHoy}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar size={28} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">
                {estadisticas.pendientes}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock size={28} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-3xl font-bold text-green-600">
                {estadisticas.completados}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-3xl font-bold text-red-600">
                {estadisticas.cancelados}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle size={28} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pacientes</p>
              <p className="text-3xl font-bold text-gray-900">
                {estadisticas.totalPacientes}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profesionales</p>
              <p className="text-3xl font-bold text-gray-900">
                {estadisticas.totalProfesionales}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users size={28} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* QR de Instalación */}
      <div className="mb-8">
        <QRInstalacion />
      </div>

      {/* Turnos Recientes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Últimos Turnos del Día
        </h2>

        {turnosRecientes.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No hay turnos para mostrar
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Paciente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Profesional
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {turnosRecientes.map((turno) => (
                  <tr key={turno.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {format(new Date(turno.fechaHora), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {turno.paciente.apellido}, {turno.paciente.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {turno.profesional.apellido}, {turno.profesional.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          turno.estado === 'COMPLETADO'
                            ? 'bg-green-100 text-green-800'
                            : turno.estado === 'PENDIENTE' ||
                              turno.estado === 'CONFIRMADO'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {turno.estado.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
