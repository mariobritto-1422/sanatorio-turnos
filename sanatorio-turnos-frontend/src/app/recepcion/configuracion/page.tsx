'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Loading } from '@/components/ui/Loading';
import { Save, Loader2, Clock, Calendar, Phone, Mail } from 'lucide-react';

const DIAS_SEMANA = [
  { valor: '1', label: 'Lunes' },
  { valor: '2', label: 'Martes' },
  { valor: '3', label: 'Miércoles' },
  { valor: '4', label: 'Jueves' },
  { valor: '5', label: 'Viernes' },
  { valor: '6', label: 'Sábado' },
  { valor: '0', label: 'Domingo' },
];

export default function ConfiguracionPage() {
  const { token } = useAuthStore();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    horarioApertura: '08:00',
    horarioCierre: '20:00',
    diasAtencion: '1,2,3,4,5',
    duracionTurnoDefaultMin: 30,
    telefonoContacto: '',
    emailContacto: '',
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res: any = await api.get('/configuracion-sanatorio', token!);
      if (res.success && res.data) {
        setForm({
          horarioApertura: res.data.horarioApertura || '08:00',
          horarioCierre: res.data.horarioCierre || '20:00',
          diasAtencion: res.data.diasAtencion || '1,2,3,4,5',
          duracionTurnoDefaultMin: res.data.duracionTurnoDefaultMin || 30,
          telefonoContacto: res.data.telefonoContacto || '',
          emailContacto: res.data.emailContacto || '',
        });
      }
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const guardar = async () => {
    setError('');
    setGuardado(false);
    setGuardando(true);
    try {
      await api.put('/configuracion-sanatorio', form, token!);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const toggleDia = (dia: string) => {
    const dias = form.diasAtencion ? form.diasAtencion.split(',').filter(Boolean) : [];
    const idx = dias.indexOf(dia);
    if (idx >= 0) {
      dias.splice(idx, 1);
    } else {
      dias.push(dia);
      dias.sort();
    }
    setForm(f => ({ ...f, diasAtencion: dias.join(',') }));
  };

  const diasActivos = form.diasAtencion ? form.diasAtencion.split(',').filter(Boolean) : [];

  if (cargando) return <Loading mensaje="Cargando configuración..." />;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración del Sistema</h1>
        <p className="text-gray-600">Parámetros generales de funcionamiento del sanatorio</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}
      {guardado && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-6">
          Configuración guardada correctamente.
        </div>
      )}

      <div className="space-y-6">
        {/* Horarios */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-800">Horario de atención</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apertura</label>
              <input
                type="time"
                value={form.horarioApertura}
                onChange={e => setForm(f => ({ ...f, horarioApertura: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cierre</label>
              <input
                type="time"
                value={form.horarioCierre}
                onChange={e => setForm(f => ({ ...f, horarioCierre: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Días de atención */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-primary-500" />
            <h2 className="font-semibold text-gray-800">Días de atención</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIAS_SEMANA.map(dia => {
              const activo = diasActivos.includes(dia.valor);
              return (
                <button
                  key={dia.valor}
                  onClick={() => toggleDia(dia.valor)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    activo
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duración de turnos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Duración default de turnos</h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={form.duracionTurnoDefaultMin}
              onChange={e => setForm(f => ({ ...f, duracionTurnoDefaultMin: Number(e.target.value) }))}
              className="flex-1"
            />
            <div className="text-lg font-semibold text-primary-600 w-20 text-right">
              {form.duracionTurnoDefaultMin} min
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Esta duración se usa como referencia. Cada profesional puede tener su propia duración configurada.
          </p>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Datos de contacto del sanatorio</h2>
          <div className="space-y-4">
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.telefonoContacto}
                onChange={e => setForm(f => ({ ...f, telefonoContacto: e.target.value }))}
                placeholder="Teléfono principal del sanatorio"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.emailContacto}
                onChange={e => setForm(f => ({ ...f, emailContacto: e.target.value }))}
                placeholder="Email de contacto del sanatorio"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div className="flex justify-end">
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 font-medium"
          >
            {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
}
