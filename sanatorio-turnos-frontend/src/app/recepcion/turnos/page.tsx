'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { FormularioTurno } from '@/components/recepcion/FormularioTurno';
import { Plus, Filter, Check, X, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function GestionTurnosPage() {
  const { token } = useAuthStore();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [obrasSociales, setObrasSociales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [turnoEditar, setTurnoEditar] = useState<any>(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    profesionalId: '',
    obraSocialId: '',
    estado: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarTurnos();
  }, [filtros]);

  const cargarDatos = async () => {
    try {
      const [profResp, osResp] = await Promise.all([
        api.getProfesionales(token!),
        api.getAll('/obras-sociales', token!),
      ]);

      if (profResp.success) setProfesionales(profResp.data);
      if (osResp.success) setObrasSociales(osResp.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const cargarTurnos = async () => {
    try {
      setCargando(true);
      const params: any = {
        desde: `${filtros.fecha}T00:00:00`,
        hasta: `${filtros.fecha}T23:59:59`,
      };

      if (filtros.profesionalId) params.profesionalId = filtros.profesionalId;
      if (filtros.estado) params.estado = filtros.estado;

      const response = await api.getTurnos(params, token!);

      if (response.success) {
        let turnosFiltrados = response.data;

        // Filtrar por obra social en frontend si es necesario
        if (filtros.obraSocialId) {
          turnosFiltrados = turnosFiltrados.filter(
            (t: any) => t.obraSocial?.id === filtros.obraSocialId
          );
        }

        setTurnos(turnosFiltrados);
      }
    } catch (err) {
      console.error('Error al cargar turnos:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleMarcarAsistencia = async (turnoId: string, estado: string) => {
    try {
      await api.updateTurno(turnoId, { estado }, token!);
      cargarTurnos();
    } catch (err) {
      alert('Error al actualizar turno');
    }
  };

  const handleCancelar = async (turnoId: string) => {
    if (!confirm('¿Cancelar este turno?')) return;

    try {
      await api.cancelarTurno(
        turnoId,
        'Cancelado por recepción',
        token!
      );
      cargarTurnos();
    } catch (err) {
      alert('Error al cancelar turno');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Turnos
          </h1>
          <p className="text-gray-600">Administrar todos los turnos del sanatorio</p>
        </div>
        <button
          onClick={() => {
            setTurnoEditar(null);
            setMostrarForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white
                     rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuevo Turno
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesional
            </label>
            <select
              value={filtros.profesionalId}
              onChange={(e) =>
                setFiltros({ ...filtros, profesionalId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obra Social
            </label>
            <select
              value={filtros.obraSocialId}
              onChange={(e) =>
                setFiltros({ ...filtros, obraSocialId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas</option>
              {obrasSociales.map((os) => (
                <option key={os.id} value={os.id}>
                  {os.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="EN_CURSO">En Curso</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO_PACIENTE">Cancelado</option>
              <option value="AUSENTE">Ausente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Turnos */}
      {cargando ? (
        <Loading mensaje="Cargando turnos..." />
      ) : turnos.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <p className="text-gray-500">No hay turnos para los filtros seleccionados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  Obra Social
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {turnos.map((turno) => (
                <tr key={turno.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {format(new Date(turno.fechaHora), 'HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {turno.paciente.apellido}, {turno.paciente.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {turno.profesional.apellido}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {turno.obraSocial?.nombre || '-'}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(turno.estado === 'PENDIENTE' ||
                        turno.estado === 'CONFIRMADO') && (
                        <>
                          <button
                            onClick={() => handleMarcarAsistencia(turno.id, 'EN_CURSO')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded
                                       transition-colors"
                            title="Marcar presente"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleMarcarAsistencia(turno.id, 'AUSENTE')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded
                                       transition-colors"
                            title="Marcar ausente"
                          >
                            <X size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setTurnoEditar(turno);
                              setMostrarForm(true);
                            }}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded
                                       transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleCancelar(turno.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded
                                   transition-colors"
                        title="Cancelar"
                      >
                        <X size={18} />
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
        <FormularioTurno
          turno={turnoEditar}
          onClose={() => {
            setMostrarForm(false);
            setTurnoEditar(null);
          }}
          onSave={cargarTurnos}
        />
      )}
    </div>
  );
}
