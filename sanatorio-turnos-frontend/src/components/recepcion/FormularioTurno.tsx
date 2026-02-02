'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface FormularioTurnoProps {
  turno?: any;
  onClose: () => void;
  onSave: () => void;
}

export function FormularioTurno({ turno, onClose, onSave }: FormularioTurnoProps) {
  const { token } = useAuthStore();
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pacienteId: turno?.paciente?.id || '',
    profesionalId: turno?.profesional?.id || '',
    fechaHora: turno?.fechaHora ? turno.fechaHora.slice(0, 16) : '',
    duracionMinutos: turno?.duracionMinutos || 30,
    tipo: turno?.tipo || 'CONTROL',
    motivoConsulta: turno?.motivoConsulta || '',
    obraSocialId: turno?.obraSocial?.id || '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [profResponse, pacResponse] = await Promise.all([
        api.getProfesionales(token!),
        api.getAll('/pacientes', token!),
      ]);

      if (profResponse.success) setProfesionales(profResponse.data);
      if (pacResponse.success) setPacientes(pacResponse.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (turno) {
        // Actualizar turno existente
        await api.updateTurno(
          turno.id,
          {
            fechaHora: new Date(formData.fechaHora).toISOString(),
            motivoConsulta: formData.motivoConsulta,
          },
          token!
        );
      } else {
        // Crear nuevo turno
        await api.createTurno(
          {
            ...formData,
            fechaHora: new Date(formData.fechaHora).toISOString(),
          },
          token!
        );
      }

      onSave();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al guardar turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {turno ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paciente *
            </label>
            <select
              required
              disabled={!!turno}
              value={formData.pacienteId}
              onChange={(e) =>
                setFormData({ ...formData, pacienteId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre} - DNI: {p.dni}
                </option>
              ))}
            </select>
          </div>

          {/* Profesional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesional *
            </label>
            <select
              required
              disabled={!!turno}
              value={formData.profesionalId}
              onChange={(e) =>
                setFormData({ ...formData, profesionalId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar profesional</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre} - {p.especialidad}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.fechaHora}
                onChange={(e) =>
                  setFormData({ ...formData, fechaHora: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos)
              </label>
              <input
                type="number"
                min="15"
                max="120"
                step="15"
                value={formData.duracionMinutos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duracionMinutos: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={!!turno}
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Turno
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={!!turno}
            >
              <option value="PRIMERA_VEZ">Primera Vez</option>
              <option value="CONTROL">Control</option>
              <option value="URGENCIA">Urgencia</option>
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de Consulta
            </label>
            <textarea
              value={formData.motivoConsulta}
              onChange={(e) =>
                setFormData({ ...formData, motivoConsulta: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         resize-none"
              placeholder="Descripción breve..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg
                         hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500
                         text-white rounded-lg hover:bg-primary-600 transition-colors
                         font-medium disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
