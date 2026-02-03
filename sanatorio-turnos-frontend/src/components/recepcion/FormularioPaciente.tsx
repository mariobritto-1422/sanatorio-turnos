'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface FormularioPacienteProps {
  paciente?: any;
  onClose: () => void;
  onSave: () => void;
}

export function FormularioPaciente({
  paciente,
  onClose,
  onSave,
}: FormularioPacienteProps) {
  const { token } = useAuthStore();
  const [obrasSociales, setObrasSociales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dni: paciente?.dni || '',
    nombre: paciente?.nombre || '',
    apellido: paciente?.apellido || '',
    fechaNacimiento: paciente?.fechaNacimiento?.slice(0, 10) || '',
    genero: paciente?.genero || 'MASCULINO',
    telefono: paciente?.telefono || '',
    email: paciente?.email || '',
    direccion: paciente?.direccion || '',
    localidad: paciente?.localidad || '',
    provincia: paciente?.provincia || '',
    obraSocialId: paciente?.obraSocial?.id || '',
    numeroAfiliado: paciente?.numeroAfiliado || '',
    observacionesMedicas: paciente?.observacionesMedicas || '',
    familiarResponsableNombre: paciente?.familiarResponsableNombre || '',
    familiarResponsableTelefono: paciente?.familiarResponsableTelefono || '',
    familiarResponsableRelacion: paciente?.familiarResponsableRelacion || '',
  });

  useEffect(() => {
    cargarObrasSociales();
  }, []);

  const cargarObrasSociales = async () => {
    try {
      const response = await api.getAll('/obras-sociales', token!);
      if (response.success) {
        setObrasSociales(response.data);
      }
    } catch (err) {
      console.error('Error al cargar obras sociales:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paciente) {
        await api.updatePaciente(paciente.id, formData, token!);
      } else {
        await api.createPaciente(formData, token!);
      }

      onSave();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al guardar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {paciente ? 'Editar Paciente' : 'Nuevo Paciente'}
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
          {/* Datos Básicos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Datos Básicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!paciente}
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             disabled:bg-gray-100"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaNacimiento}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaNacimiento: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  required
                  value={formData.genero}
                  onChange={(e) =>
                    setFormData({ ...formData, genero: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                  <option value="NO_ESPECIFICA">Prefiere no especificar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="11-1234-5678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dirección
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calle y Número
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localidad
                </label>
                <input
                  type="text"
                  value={formData.localidad}
                  onChange={(e) =>
                    setFormData({ ...formData, localidad: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  value={formData.provincia}
                  onChange={(e) =>
                    setFormData({ ...formData, provincia: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Obra Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Obra Social
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obra Social
                </label>
                <select
                  value={formData.obraSocialId}
                  onChange={(e) =>
                    setFormData({ ...formData, obraSocialId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sin obra social</option>
                  {obrasSociales.map((os) => (
                    <option key={os.id} value={os.id}>
                      {os.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Afiliado
                </label>
                <input
                  type="text"
                  value={formData.numeroAfiliado}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroAfiliado: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones Médicas (alergias, etc.)
            </label>
            <textarea
              value={formData.observacionesMedicas}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observacionesMedicas: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         resize-none"
            />
          </div>

          {/* Familiar Responsable */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Familiar Responsable (opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.familiarResponsableNombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      familiarResponsableNombre: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.familiarResponsableTelefono}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      familiarResponsableTelefono: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relación
                </label>
                <input
                  type="text"
                  value={formData.familiarResponsableRelacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      familiarResponsableRelacion: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Padre, Hermano..."
                />
              </div>
            </div>
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
