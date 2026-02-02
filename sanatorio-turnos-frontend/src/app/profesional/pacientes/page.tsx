'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { FichaPaciente } from '@/components/profesional/FichaPaciente';
import { Search, User } from 'lucide-react';

export default function PacientesPage() {
  const { token } = useAuthStore();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      const response = await api.getAll('/pacientes', token!);

      if (response.success) {
        setPacientes(response.data);
      }
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      cargarPacientes();
      return;
    }

    try {
      setCargando(true);
      const response = await api.getAll(
        `/pacientes?search=${encodeURIComponent(busqueda)}`,
        token!
      );

      if (response.success) {
        setPacientes(response.data);
      }
    } catch (err) {
      console.error('Error al buscar:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleClickPaciente = async (paciente: any) => {
    setPacienteSeleccionado(paciente);
    setMostrarFicha(true);
  };

  const pacientesFiltrados = busqueda
    ? pacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.dni.includes(busqueda)
      )
    : pacientes;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pacientes</h1>
        <p className="text-gray-600">
          Datos básicos de todos los pacientes del sanatorio
        </p>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              placeholder="Buscar por nombre, apellido o DNI..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         transition-all"
            />
          </div>
          <button
            onClick={handleBuscar}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg
                       hover:bg-primary-600 transition-colors font-medium"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Lista de Pacientes */}
      {cargando ? (
        <Loading mensaje="Cargando pacientes..." />
      ) : pacientesFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
          <p className="text-gray-500">No se encontraron pacientes</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Obra Social
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pacientesFiltrados.map((paciente) => (
                <tr
                  key={paciente.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {paciente.apellido}, {paciente.nombre}
                        </p>
                        <p className="text-sm text-gray-500">{paciente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {paciente.dni}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {paciente.telefono}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {paciente.obraSocial?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleClickPaciente(paciente)}
                      className="px-4 py-2 text-sm font-medium text-primary-600
                                 hover:text-primary-700 hover:bg-primary-50 rounded-lg
                                 transition-colors"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ficha Paciente */}
      {mostrarFicha && pacienteSeleccionado && (
        <FichaPaciente
          paciente={pacienteSeleccionado}
          onClose={() => setMostrarFicha(false)}
        />
      )}
    </div>
  );
}
