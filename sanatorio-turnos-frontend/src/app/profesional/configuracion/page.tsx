'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { Clock, Calendar, Plus, Trash2, Save } from 'lucide-react';

const diasSemana = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export default function ConfiguracionPage() {
  const { token, usuario } = useAuthStore();
  const [horarios, setHorarios] = useState<any[]>([]);
  const [bloqueos, setBloqueos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Formulario de nuevo horario
  const [nuevoHorario, setNuevoHorario] = useState({
    diaSemana: 1,
    horaInicio: '09:00',
    horaFin: '17:00',
  });

  // Formulario de nuevo bloqueo
  const [nuevoBloqueo, setNuevoBloqueo] = useState({
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
    tipo: 'VACACIONES' as const,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const profesionalId = usuario?.profesional?.id;
      if (!profesionalId) return;

      // Cargar horarios
      // Aquí deberías hacer la llamada a la API
      // const response = await api.getHorarios(profesionalId, token!);

      // Por ahora, simulamos datos vacíos
      setHorarios([]);
      setBloqueos([]);
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarHorario = async () => {
    try {
      setGuardando(true);
      const profesionalId = usuario?.profesional?.id;

      // Aquí harías la llamada a la API para crear el horario
      // await api.createHorario({ ...nuevoHorario, profesionalId }, token!);

      // Simular éxito
      alert('Horario agregado correctamente');
      setNuevoHorario({ diaSemana: 1, horaInicio: '09:00', horaFin: '17:00' });
      cargarDatos();
    } catch (err) {
      alert('Error al agregar horario');
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarBloqueo = async () => {
    try {
      setGuardando(true);
      const profesionalId = usuario?.profesional?.id;

      if (!nuevoBloqueo.fechaInicio || !nuevoBloqueo.fechaFin) {
        alert('Debes completar las fechas');
        return;
      }

      // Aquí harías la llamada a la API para crear el bloqueo
      // await api.createBloqueo({ ...nuevoBloqueo, profesionalId }, token!);

      alert('Bloqueo agregado correctamente');
      setNuevoBloqueo({
        fechaInicio: '',
        fechaFin: '',
        motivo: '',
        tipo: 'VACACIONES',
      });
      cargarDatos();
    } catch (err) {
      alert('Error al agregar bloqueo');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8">
        <Loading mensaje="Cargando configuración..." />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-600">
          Gestiona tus horarios de atención y bloqueos
        </p>
      </div>

      {/* Horarios de Atención */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock size={24} className="text-primary-600" />
          Horarios de Atención
        </h2>

        {/* Lista de Horarios */}
        <div className="mb-6 space-y-3">
          {horarios.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay horarios configurados
            </p>
          ) : (
            horarios.map((horario) => (
              <div
                key={horario.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {diasSemana.find((d) => d.value === horario.diaSemana)?.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {horario.horaInicio} - {horario.horaFin}
                  </p>
                </div>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Formulario Nuevo Horario */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Agregar Horario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Día
              </label>
              <select
                value={nuevoHorario.diaSemana}
                onChange={(e) =>
                  setNuevoHorario({
                    ...nuevoHorario,
                    diaSemana: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {diasSemana.map((dia) => (
                  <option key={dia.value} value={dia.value}>
                    {dia.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Inicio
              </label>
              <input
                type="time"
                value={nuevoHorario.horaInicio}
                onChange={(e) =>
                  setNuevoHorario({ ...nuevoHorario, horaInicio: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Fin
              </label>
              <input
                type="time"
                value={nuevoHorario.horaFin}
                onChange={(e) =>
                  setNuevoHorario({ ...nuevoHorario, horaFin: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <button
            onClick={handleAgregarHorario}
            disabled={guardando}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-500
                       text-white rounded-lg hover:bg-primary-600 transition-colors
                       font-medium disabled:opacity-50"
          >
            <Plus size={20} />
            {guardando ? 'Guardando...' : 'Agregar Horario'}
          </button>
        </div>
      </div>

      {/* Bloqueos de Horario */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar size={24} className="text-primary-600" />
          Bloqueos de Horario
        </h2>

        {/* Lista de Bloqueos */}
        <div className="mb-6 space-y-3">
          {bloqueos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay bloqueos configurados
            </p>
          ) : (
            bloqueos.map((bloqueo) => (
              <div
                key={bloqueo.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{bloqueo.motivo}</p>
                  <p className="text-sm text-gray-600">
                    {bloqueo.fechaInicio} - {bloqueo.fechaFin}
                  </p>
                </div>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Formulario Nuevo Bloqueo */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Agregar Bloqueo</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={nuevoBloqueo.fechaInicio}
                  onChange={(e) =>
                    setNuevoBloqueo({ ...nuevoBloqueo, fechaInicio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={nuevoBloqueo.fechaFin}
                  onChange={(e) =>
                    setNuevoBloqueo({ ...nuevoBloqueo, fechaFin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo
              </label>
              <input
                type="text"
                value={nuevoBloqueo.motivo}
                onChange={(e) =>
                  setNuevoBloqueo({ ...nuevoBloqueo, motivo: e.target.value })
                }
                placeholder="Ej: Vacaciones, Congreso, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={nuevoBloqueo.tipo}
                onChange={(e) =>
                  setNuevoBloqueo({
                    ...nuevoBloqueo,
                    tipo: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="VACACIONES">Vacaciones</option>
                <option value="LICENCIA">Licencia</option>
                <option value="CONGRESO">Congreso</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAgregarBloqueo}
            disabled={guardando}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-500
                       text-white rounded-lg hover:bg-primary-600 transition-colors
                       font-medium disabled:opacity-50"
          >
            <Plus size={20} />
            {guardando ? 'Guardando...' : 'Agregar Bloqueo'}
          </button>
        </div>
      </div>
    </div>
  );
}
