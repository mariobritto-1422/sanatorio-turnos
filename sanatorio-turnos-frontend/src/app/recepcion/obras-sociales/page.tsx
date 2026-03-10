'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, X, Save, Loader2 } from 'lucide-react';

const FORM_INICIAL = {
  nombre: '',
  codigo: '',
  plan: '',
  telefono: '',
  email: '',
};

export default function GestionObrasSocialesPage() {
  const { token } = useAuthStore();
  const [obrasSociales, setObrasSociales] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, [mostrarTodas]);

  const cargar = async () => {
    setCargando(true);
    try {
      const url = mostrarTodas ? '/obras-sociales?activas=false' : '/obras-sociales';
      const res: any = await api.getAll(url, token!);
      if (res.success) setObrasSociales(res.data);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const abrirCrear = () => {
    setSeleccionada(null);
    setForm({ ...FORM_INICIAL });
    setError('');
    setMostrarForm(true);
  };

  const abrirEditar = (os: any) => {
    setSeleccionada(os);
    setForm({
      nombre: os.nombre,
      codigo: os.codigo || '',
      plan: os.plan || '',
      telefono: os.telefono || '',
      email: os.email || '',
    });
    setError('');
    setMostrarForm(true);
  };

  const guardar = async () => {
    setError('');
    if (!form.nombre.trim()) {
      setError('El nombre es requerido.');
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim() || undefined,
        plan: form.plan.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        email: form.email.trim() || undefined,
      };
      if (seleccionada) {
        await api.put(`/obras-sociales/${seleccionada.id}`, payload, token!);
      } else {
        await api.post('/obras-sociales', payload, token!);
      }
      setMostrarForm(false);
      await cargar();
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (os: any) => {
    const estaActiva = os.estado === 'ACTIVO';
    if (!confirm(`¿${estaActiva ? 'Desactivar' : 'Activar'} "${os.nombre}"?`)) return;
    try {
      await api.put(`/obras-sociales/${os.id}`, { estado: estaActiva ? 'INACTIVO' : 'ACTIVO' }, token!);
      await cargar();
    } catch (e: any) {
      alert(e.message || 'Error al cambiar estado');
    }
  };

  const filtradas = busqueda
    ? obrasSociales.filter(os =>
        os.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (os.codigo && os.codigo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (os.plan && os.plan.toLowerCase().includes(busqueda.toLowerCase()))
      )
    : obrasSociales;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Obras Sociales</h1>
          <p className="text-gray-600">Administrar convenios y cobertura médica</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Nueva Obra Social
        </button>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o plan..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={mostrarTodas}
            onChange={e => setMostrarTodas(e.target.checked)}
            className="rounded border-gray-300"
          />
          Mostrar inactivas
        </label>
      </div>

      {/* Tabla */}
      {cargando ? (
        <Loading mensaje="Cargando obras sociales..." />
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <p className="text-gray-500">No se encontraron obras sociales</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtradas.map(os => (
                <tr key={os.id} className={`hover:bg-gray-50 ${os.estado === 'INACTIVO' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{os.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{os.codigo || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{os.plan || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{os.telefono || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      os.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {os.estado === 'ACTIVO' ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => abrirEditar(os)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleEstado(os)}
                        className={`p-2 rounded-lg transition-colors ${
                          os.estado === 'ACTIVO' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={os.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      >
                        {os.estado === 'ACTIVO' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {seleccionada ? 'Editar Obra Social' : 'Nueva Obra Social'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: OSDE, Swiss Medical..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                    placeholder="Ej: OSDE310"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <input
                    type="text"
                    value={form.plan}
                    onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    placeholder="Ej: Plan 310"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
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
                {seleccionada ? 'Guardar cambios' : 'Crear obra social'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
