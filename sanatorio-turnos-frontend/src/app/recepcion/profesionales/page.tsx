'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Edit, UserX, UserCheck, X, Save, Loader2 } from 'lucide-react';

const ESPECIALIDADES = [
  'Psiquiatría',
  'Psicología',
  'Neurología',
  'Medicina General',
  'Trabajo Social',
  'Terapia Ocupacional',
  'Enfermería',
  'Otra',
];

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  matricula: '',
  especialidad: '',
  telefono: '',
  email: '',
  duracionTurnoMinutos: 30,
  usuarioEmail: '',
  usuarioPassword: '',
};

export default function GestionProfesionalesPage() {
  const { token } = useAuthStore();
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res: any = await api.getAll('/profesionales', token!);
      if (res.success) setProfesionales(res.data);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const abrirCrear = () => {
    setSeleccionado(null);
    setForm({ ...FORM_INICIAL });
    setError('');
    setMostrarForm(true);
  };

  const abrirEditar = (prof: any) => {
    setSeleccionado(prof);
    setForm({
      nombre: prof.nombre,
      apellido: prof.apellido,
      matricula: prof.matricula,
      especialidad: prof.especialidad,
      telefono: prof.telefono || '',
      email: prof.email || '',
      duracionTurnoMinutos: prof.duracionTurnoMinutos,
      usuarioEmail: '',
      usuarioPassword: '',
    });
    setError('');
    setMostrarForm(true);
  };

  const guardar = async () => {
    setError('');
    if (!form.nombre || !form.apellido || !form.matricula || !form.especialidad) {
      setError('Nombre, apellido, matrícula y especialidad son requeridos.');
      return;
    }
    if (!seleccionado && (!form.usuarioEmail || !form.usuarioPassword)) {
      setError('Email y contraseña de acceso son requeridos para nuevos profesionales.');
      return;
    }
    setGuardando(true);
    try {
      if (seleccionado) {
        await api.put(`/profesionales/${seleccionado.id}`, {
          nombre: form.nombre,
          apellido: form.apellido,
          especialidad: form.especialidad,
          telefono: form.telefono,
          email: form.email,
          duracionTurnoMinutos: Number(form.duracionTurnoMinutos),
        }, token!);
      } else {
        await api.post('/profesionales', {
          nombre: form.nombre,
          apellido: form.apellido,
          matricula: form.matricula,
          especialidad: form.especialidad,
          telefono: form.telefono,
          email: form.email,
          duracionTurnoMinutos: Number(form.duracionTurnoMinutos),
          usuarioEmail: form.usuarioEmail,
          usuarioPassword: form.usuarioPassword,
        }, token!);
      }
      setMostrarForm(false);
      await cargar();
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (prof: any) => {
    const accion = prof.estado === 'ACTIVO' ? 'desactivar' : 'activar';
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${prof.apellido}, ${prof.nombre}?`)) return;
    try {
      await api.put(`/profesionales/${prof.id}`, {
        estado: prof.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
      }, token!);
      await cargar();
    } catch (e: any) {
      alert(e.message || 'Error al cambiar estado');
    }
  };

  const filtrados = busqueda
    ? profesionales.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.especialidad.toLowerCase().includes(busqueda.toLowerCase())
      )
    : profesionales;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Profesionales</h1>
          <p className="text-gray-600">Administrar médicos y terapeutas del sanatorio</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuevo Profesional
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6 relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido, matrícula o especialidad..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Tabla */}
      {cargando ? (
        <Loading mensaje="Cargando profesionales..." />
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <p className="text-gray-500">No se encontraron profesionales</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Profesional</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Matrícula</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Especialidad</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Turno</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtrados.map(prof => (
                <tr key={prof.id} className={`hover:bg-gray-50 ${prof.estado === 'INACTIVO' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{prof.apellido}, {prof.nombre}</div>
                    <div className="text-xs text-gray-400">{prof.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{prof.matricula}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{prof.especialidad}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{prof.duracionTurnoMinutos} min</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      prof.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {prof.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => abrirEditar(prof)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleEstado(prof)}
                        className={`p-2 rounded-lg transition-colors ${
                          prof.estado === 'ACTIVO'
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={prof.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      >
                        {prof.estado === 'ACTIVO' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulario */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {seleccionado ? 'Editar Profesional' : 'Nuevo Profesional'}
              </h2>
              <button onClick={() => setMostrarForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                  <input
                    type="text"
                    value={form.matricula}
                    onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))}
                    disabled={!!seleccionado}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración turno (min)</label>
                  <input
                    type="number"
                    value={form.duracionTurnoMinutos}
                    min={10}
                    max={120}
                    step={5}
                    onChange={e => setForm(f => ({ ...f, duracionTurnoMinutos: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                <select
                  value={form.especialidad}
                  onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar...</option>
                  {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email profesional</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {!seleccionado && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Acceso al sistema</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email de login *</label>
                      <input
                        type="email"
                        value={form.usuarioEmail}
                        onChange={e => setForm(f => ({ ...f, usuarioEmail: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                      <input
                        type="password"
                        value={form.usuarioPassword}
                        onChange={e => setForm(f => ({ ...f, usuarioPassword: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setMostrarForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm font-medium"
              >
                {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {seleccionado ? 'Guardar cambios' : 'Crear profesional'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
