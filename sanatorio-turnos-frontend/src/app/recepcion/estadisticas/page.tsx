'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, eachHourOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Download, TrendingUp, Users, Activity, Clock } from 'lucide-react';
import { GraficoTorta } from '@/components/recepcion/GraficoTorta';
import { GraficoBarras } from '@/components/recepcion/GraficoBarras';
import { GraficoLinea } from '@/components/recepcion/GraficoLinea';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  exportarTurnosExcel,
  exportarTurnosCSV,
  exportarEstadisticasOSExcel,
  exportarResumenProfesionalPDF,
} from '@/lib/export';

type Periodo = 'dia' | 'semana' | 'mes';

export default function EstadisticasPage() {
  const { token } = useAuthStore();
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calcular rango de fechas según período
  const calcularRango = () => {
    switch (periodo) {
      case 'dia':
        return {
          inicio: startOfDay(fechaSeleccionada),
          fin: endOfDay(fechaSeleccionada),
        };
      case 'semana':
        return {
          inicio: startOfWeek(fechaSeleccionada, { locale: es }),
          fin: endOfWeek(fechaSeleccionada, { locale: es }),
        };
      case 'mes':
        return {
          inicio: startOfMonth(fechaSeleccionada),
          fin: endOfMonth(fechaSeleccionada),
        };
    }
  };

  // Cargar turnos
  useEffect(() => {
    const cargarTurnos = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const rango = calcularRango();
        const response = await api.getTurnos(
          {
            inicio: rango.inicio.toISOString(),
            fin: rango.fin.toISOString(),
          },
          token
        );
        if (response.success) {
          setTurnos(response.data);
        }
      } catch (error) {
        console.error('Error al cargar turnos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarTurnos();
  }, [periodo, fechaSeleccionada, token]);

  // ============================================
  // CÁLCULO DE ESTADÍSTICAS
  // ============================================

  // Total de turnos
  const totalTurnos = turnos.length;

  // Turnos completados
  const turnosCompletados = turnos.filter((t) => t.estado === 'COMPLETADO').length;

  // Turnos ausentes
  const turnosAusentes = turnos.filter((t) => t.estado === 'AUSENTE').length;

  // Tasa de ausentismo
  const tasaAusentismo = totalTurnos > 0 ? (turnosAusentes / totalTurnos) * 100 : 0;

  // Distribución por profesional
  const distribucionProfesional = () => {
    const conteo: { [key: string]: { nombre: string; cantidad: number } } = {};

    turnos.forEach((turno) => {
      const key = turno.profesional.id;
      const nombre = `${turno.profesional.apellido}, ${turno.profesional.nombre}`;

      if (!conteo[key]) {
        conteo[key] = { nombre, cantidad: 0 };
      }
      conteo[key].cantidad++;
    });

    return Object.values(conteo).map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
    }));
  };

  // Distribución por obra social
  const distribucionObraSocial = () => {
    const conteo: { [key: string]: { nombre: string; cantidad: number } } = {};

    turnos.forEach((turno) => {
      const key = turno.obraSocial?.id || 'sin-os';
      const nombre = turno.obraSocial?.nombre || 'Sin obra social';

      if (!conteo[key]) {
        conteo[key] = { nombre, cantidad: 0 };
      }
      conteo[key].cantidad++;
    });

    return Object.values(conteo).map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
    }));
  };

  // Horarios con más demanda (por hora del día)
  const demandaPorHora = () => {
    const conteo: { [hora: number]: number } = {};

    // Inicializar todas las horas
    for (let h = 0; h < 24; h++) {
      conteo[h] = 0;
    }

    turnos.forEach((turno) => {
      const hora = new Date(turno.fechaHora).getHours();
      conteo[hora]++;
    });

    return Object.entries(conteo).map(([hora, cantidad]) => ({
      hora: `${hora.toString().padStart(2, '0')}:00`,
      cantidad,
    }));
  };

  // Tendencia mensual (últimos 30 días si periodo = mes)
  const tendenciaMensual = () => {
    if (periodo !== 'mes') {
      return [];
    }

    const rango = calcularRango();
    const dias = eachDayOfInterval({ start: rango.inicio, end: rango.fin });

    return dias.map((dia) => {
      const turnosDia = turnos.filter((turno) => {
        const fechaTurno = startOfDay(new Date(turno.fechaHora));
        return fechaTurno.getTime() === dia.getTime();
      });

      return {
        fecha: format(dia, 'dd/MM', { locale: es }),
        cantidad: turnosDia.length,
      };
    });
  };

  // Estadísticas detalladas por obra social (para exportar)
  const estadisticasObraSocial = () => {
    const stats: { [key: string]: any } = {};

    turnos.forEach((turno) => {
      const key = turno.obraSocial?.id || 'sin-os';
      const nombre = turno.obraSocial?.nombre || 'Sin obra social';

      if (!stats[key]) {
        stats[key] = {
          nombre,
          totalTurnos: 0,
          completados: 0,
          cancelados: 0,
          ausentes: 0,
        };
      }

      stats[key].totalTurnos++;
      if (turno.estado === 'COMPLETADO') stats[key].completados++;
      if (turno.estado === 'CANCELADO') stats[key].cancelados++;
      if (turno.estado === 'AUSENTE') stats[key].ausentes++;
    });

    return Object.values(stats).map((stat: any) => ({
      ...stat,
      tasaCompletados: stat.totalTurnos > 0 ? (stat.completados / stat.totalTurnos) * 100 : 0,
      tasaAusentismo: stat.totalTurnos > 0 ? (stat.ausentes / stat.totalTurnos) * 100 : 0,
    }));
  };

  // ============================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================

  const handleExportarTurnosExcel = () => {
    const nombreArchivo = `turnos_${format(fechaSeleccionada, 'yyyyMMdd')}`;
    exportarTurnosExcel(turnos, nombreArchivo);
  };

  const handleExportarTurnosCSV = () => {
    const nombreArchivo = `turnos_${format(fechaSeleccionada, 'yyyyMMdd')}`;
    exportarTurnosCSV(turnos, nombreArchivo);
  };

  const handleExportarEstadisticasOS = () => {
    const stats = estadisticasObraSocial();
    const nombreArchivo = `estadisticas_os_${format(fechaSeleccionada, 'yyyyMMdd')}`;
    exportarEstadisticasOSExcel(stats, nombreArchivo);
  };

  const handleExportarResumenProfesional = async (profesionalId: string) => {
    // Obtener datos del profesional
    const response = await fetch(`/api/profesionales/${profesionalId}`);
    const profesional = await response.json();

    // Filtrar turnos del profesional
    const turnosProfesional = turnos.filter((t) => t.profesional.id === profesionalId);

    // Calcular estadísticas
    const total = turnosProfesional.length;
    const completados = turnosProfesional.filter((t) => t.estado === 'COMPLETADO').length;
    const cancelados = turnosProfesional.filter((t) => t.estado === 'CANCELADO').length;
    const ausentes = turnosProfesional.filter((t) => t.estado === 'AUSENTE').length;

    const estadisticas = {
      total,
      completados,
      cancelados,
      ausentes,
      tasaCompletados: total > 0 ? (completados / total) * 100 : 0,
      tasaAusentismo: total > 0 ? (ausentes / total) * 100 : 0,
      promedioPorDia: total / 30, // Aproximado para el mes
    };

    const periodoTexto = format(fechaSeleccionada, 'MMMM yyyy', { locale: es });

    exportarResumenProfesionalPDF(profesional, turnosProfesional, estadisticas, periodoTexto);
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Estadísticas y Reportes
          </h1>
          <p className="text-gray-600">
            Análisis completo de turnos y métricas del sanatorio
          </p>
        </div>

        {/* Controles de período */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Período:</label>
            </div>

            <div className="flex gap-2">
              {(['dia', 'semana', 'mes'] as Periodo[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    periodo === p
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={format(fechaSeleccionada, 'yyyy-MM-dd')}
              onChange={(e) => setFechaSeleccionada(new Date(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-sky-100 rounded-lg">
                <Calendar className="w-6 h-6 text-sky-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalTurnos}</p>
            <p className="text-sm text-gray-600">Total de Turnos</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{turnosCompletados}</p>
            <p className="text-sm text-gray-600">Completados</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{turnosAusentes}</p>
            <p className="text-sm text-gray-600">Ausentes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{tasaAusentismo.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Tasa de Ausentismo</p>
          </div>
        </div>

        {/* Botones de exportación */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Reportes
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportarTurnosExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Turnos → Excel
            </button>
            <button
              onClick={handleExportarTurnosCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Turnos → CSV
            </button>
            <button
              onClick={handleExportarEstadisticasOS}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Estadísticas OS → Excel
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribución por profesional */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <GraficoTorta
              data={distribucionProfesional()}
              dataKey="cantidad"
              nameKey="nombre"
              title="Distribución por Profesional"
            />
          </div>

          {/* Distribución por obra social */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <GraficoTorta
              data={distribucionObraSocial()}
              dataKey="cantidad"
              nameKey="nombre"
              title="Distribución por Obra Social"
            />
          </div>
        </div>

        {/* Horarios con más demanda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <GraficoBarras
            data={demandaPorHora()}
            dataKey="cantidad"
            xAxisKey="hora"
            title="Horarios con Mayor Demanda"
            color="#3B82F6"
          />
        </div>

        {/* Tendencia mensual (solo si período = mes) */}
        {periodo === 'mes' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <GraficoLinea
              data={tendenciaMensual()}
              dataKey="cantidad"
              xAxisKey="fecha"
              title="Tendencia Mensual de Turnos"
              color="#10B981"
            />
          </div>
        )}
      </div>
    </div>
  );
}
