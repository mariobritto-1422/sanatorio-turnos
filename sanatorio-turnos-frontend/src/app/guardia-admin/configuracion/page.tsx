'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface DefinicionTurno {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
}

const DEFAULT_TURNOS: DefinicionTurno[] = [
  { nombre: 'Mañana', horaInicio: '07:00', horaFin: '13:00', horas: 6 },
  { nombre: 'Tarde',  horaInicio: '13:00', horaFin: '19:00', horas: 6 },
  { nombre: 'Noche',  horaInicio: '19:00', horaFin: '07:00', horas: 12 },
];

export default function ConfiguracionTurnosPage() {
  const { token, usuario } = useAuthStore();
  const [turnos, setTurnos] = useState<DefinicionTurno[]>(DEFAULT_TURNOS);
  const [maxDias, setMaxDias] = useState(6);
  const [maxNoches, setMaxNoches] = useState(3);
  const [diasFranco, setDiasFranco] = useState(2);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  const sanatorioId = (usuario as any)?.sanatorioId || '';

  useEffect(() => {
    if (!token || !sanatorioId) return;
    setLoading(true);
    api.get(`/configuracion-turnos/${sanatorioId}`, token)
      .then((r: any) => {
        const d = r.data;
        setTurnos(d.turnos || DEFAULT_TURNOS);
        setMaxDias(d.maxDiasSeguidosSinFranco || 6);
        setMaxNoches(d.maxNochesSeguidasPermitidas || 3);
        setDiasFranco(d.diasFrancoSemanal || 2);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, sanatorioId]);

  const guardar = async () => {
    setGuardando(true);
    setOk(false);
    try {
      await api.put(`/configuracion-turnos/${sanatorioId}`, {
        turnos,
        maxDiasSeguidosSinFranco: maxDias,
        maxNochesSeguidasPermitidas: maxNoches,
        diasFrancoSemanal: diasFranco,
      }, token!);
      setOk(true);
      setTimeout(() => setOk(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const agregarTurno = () => {
    setTurnos([...turnos, { nombre: '', horaInicio: '00:00', horaFin: '00:00', horas: 0 }]);
  };

  const actualizarTurno = (i: number, field: keyof DefinicionTurno, value: any) => {
    setTurnos(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  };

  const eliminarTurno = (i: number) => {
    setTurnos(prev => prev.filter((_, idx) => idx !== i));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de turnos</h1>
        <p className="text-sm text-gray-500">Define los turnos y restricciones del sanatorio</p>
      </div>

      {/* Turnos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Turnos definidos</h2>
        <div className="space-y-3 mb-4">
          {turnos.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-center">
              <input
                placeholder="Nombre"
                value={t.nombre}
                onChange={e => actualizarTurno(i, 'nombre', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={t.horaInicio}
                onChange={e => actualizarTurno(i, 'horaInicio', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={t.horaFin}
                onChange={e => actualizarTurno(i, 'horaFin', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={t.horas}
                onChange={e => actualizarTurno(i, 'horas', parseFloat(e.target.value))}
                placeholder="Hs"
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-16 text-center"
              />
              <button
                onClick={() => eliminarTurno(i)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-400 grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 mb-2 px-1">
          <span>Nombre</span><span>Inicio</span><span>Fin</span><span className="text-center">Hs</span><span></span>
        </div>
        <button
          onClick={agregarTurno}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Plus size={16} />
          Agregar turno
        </button>
      </div>

      {/* Restricciones */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Restricciones del algoritmo</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de días seguidos sin franco
            </label>
            <input
              type="number"
              value={maxDias}
              onChange={e => setMaxDias(parseInt(e.target.value))}
              min={1} max={14}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
            />
            <p className="text-xs text-gray-400 mt-1">Recomendado: 6</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de noches seguidas permitidas
            </label>
            <input
              type="number"
              value={maxNoches}
              onChange={e => setMaxNoches(parseInt(e.target.value))}
              min={1} max={7}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
            />
            <p className="text-xs text-gray-400 mt-1">Recomendado: 3</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días de franco por semana
            </label>
            <input
              type="number"
              value={diasFranco}
              onChange={e => setDiasFranco(parseInt(e.target.value))}
              min={1} max={4}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
            />
            <p className="text-xs text-gray-400 mt-1">Recomendado: 2</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 font-medium"
        >
          {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar configuración
        </button>
        {ok && <span className="text-green-600 text-sm font-medium">✓ Guardado correctamente</span>}
      </div>
    </div>
  );
}
