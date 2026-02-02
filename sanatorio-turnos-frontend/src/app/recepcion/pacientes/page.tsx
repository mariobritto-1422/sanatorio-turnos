'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { FormularioPaciente } from '@/components/recepcion/FormularioPaciente';
import { FichaPaciente } from '@/components/profesional/FichaPaciente';
import { Plus, Search, Edit, Eye } from 'lucide-react';

export default function GestionPacientesPage() {
  const { token } = useAuthStore();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Pacientes
          </h1>
          <p className="text-gray-600">
            Administrar pacientes del sanatorio
          </p>
        </div>
        <button
          onClick={() => {
            setPacienteSeleccionado(null);
            setMostrarForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white
                     rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuevo Paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <Loading mensaje="Cargando pacientes..." />
      ) : pacientesFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <p className="text-gray-500">No se encontraron pacientes</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Apellido y Nombre
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
                <tr key={paciente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {paciente.dni}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {paciente.apellido}, {paciente.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {paciente.telefono}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {paciente.obraSocial?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPacienteSeleccionado(paciente);
                          setMostrarFicha(true);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg
                                   transition-colors"
                        title="Ver ficha"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setPacienteSeleccionado(paciente);
                          setMostrarForm(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg
                                   transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario */}
      {mostrarForm && (
        <FormularioPaciente
          paciente={pacienteSeleccionado}
          onClose={() => {
            setMostrarForm(false);
            setPacienteSeleccionado(null);
          }}
          onSave={cargarPacientes}
        />
      )}

      {/* Ficha */}
      {mostrarFicha && pacienteSeleccionado && (
        <FichaPaciente
          paciente={pacienteSeleccionado}
          onClose={() => {
            setMostrarFicha(false);
            setPacienteSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}
