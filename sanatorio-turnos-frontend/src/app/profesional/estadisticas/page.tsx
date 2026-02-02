'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export default function EstadisticasPage() {
  const { token, usuario } = useAuthStore();
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    completados: 0,
    cancelados: 0,
    ausentes: 0,
    porDia: [] as any[],
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [periodo]);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const profesionalId = usuario?.profesional?.id;
      if (!profesionalId) return;

      const hoy = new Date();
      const desde =
        periodo === 'semana'
          ? startOfWeek(hoy, { weekStartsOn: 1 })
          : startOfMonth(hoy);
      const hasta =
        periodo === 'semana'
          ? endOfWeek(hoy, { weekStartsOn: 1 })
          : endOfMonth(hoy);

      const response = await api.getTurnos(
        {
          profesionalId,
          desde: format(desde, 'yyyy-MM-dd'),
          hasta: format(hasta, 'yyyy-MM-dd'),
        },
        token!
      );

      if (response.success) {
        const turnos = response.data;

        // Calcular estadísticas
        const stats = {
          total: turnos.length,
          completados: turnos.filter((t: any) => t.estado === 'COMPLETADO').length,
          cancelados: turnos.filter(
            (t: any) =>
              t.estado === 'CANCELADO_PACIENTE' ||
              t.estado === 'CANCELADO_PROFESIONAL'
          ).length,
          ausentes: turnos.filter((t: any) => t.estado === 'AUSENTE').length,
          porDia: [] as any[],
        };

        // Agrupar por día
        const turnosPorDia = turnos.reduce((acc: any, turno: any) => {
          const fecha = format(new Date(turno.fechaHora), 'yyyy-MM-dd');
          if (!acc[fecha]) {
            acc[fecha] = 0;
          }
          acc[fecha]++;
          return acc;
        }, {});

        stats.porDia = Object.entries(turnosPorDia).map(([fecha, cantidad]) => ({
          fecha,
          cantidad,
        }));

        setEstadisticas(stats);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setCargando(false);
    }
  };

  const tasaCompletados =
    estadisticas.total > 0
      ? ((estadisticas.completados / estadisticas.total) * 100).toFixed(1)
      : '0';

  const tasaAusentismo =
    estadisticas.total > 0
      ? ((estadisticas.ausentes / estadisticas.total) * 100).toFixed(1)
      : '0';

  if (cargando) {
    return (
      <div className="p-8">
        <Loading mensaje="Cargando estadísticas..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estadísticas</h1>
        <p className="text-gray-600">
          Resumen de tu actividad profesional
        </p>
      </div>

      {/* Selector de Período */}
      <div className="mb-8 flex gap-3">
        <button
          onClick={() => setPeriodo('semana')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            periodo === 'semana'
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setPeriodo('mes')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            periodo === 'mes'
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Este Mes
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar size={24} className="text-primary-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {periodo === 'semana' ? 'Semana' : 'Mes'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.total}
          </p>
          <p className="text-sm text-gray-600">Turnos Totales</p>
        </div>

        {/* Completados */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">
              {tasaCompletados}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.completados}
          </p>
          <p className="text-sm text-gray-600">Completados</p>
        </div>

        {/* Cancelados */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.cancelados}
          </p>
          <p className="text-sm text-gray-600">Cancelados</p>
        </div>

        {/* Ausentes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600">
              {tasaAusentismo}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {estadisticas.ausentes}
          </p>
          <p className="text-sm text-gray-600">Ausentes</p>
        </div>
      </div>

      {/* Gráfico Simple de Actividad */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-primary-600" />
          Actividad por Día
        </h2>

        {estadisticas.porDia.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay datos para mostrar
          </div>
        ) : (
          <div className="space-y-4">
            {estadisticas.porDia.map((dia) => {
              const porcentaje = (dia.cantidad / estadisticas.total) * 100;
              return (
                <div key={dia.fecha} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {format(new Date(dia.fecha), 'EEEE d/M')}
                    </span>
                    <span className="text-gray-600">{dia.cantidad} turnos</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="font-semibold text-primary-900 mb-2">📊 Resumen</h3>
        <ul className="space-y-1 text-primary-800">
          <li>
            • Promedio por día:{' '}
            {estadisticas.porDia.length > 0
              ? (estadisticas.total / estadisticas.porDia.length).toFixed(1)
              : '0'}{' '}
            turnos
          </li>
          <li>• Tasa de completados: {tasaCompletados}%</li>
          <li>• Tasa de ausentismo: {tasaAusentismo}%</li>
        </ul>
      </div>
    </div>
  );
}
