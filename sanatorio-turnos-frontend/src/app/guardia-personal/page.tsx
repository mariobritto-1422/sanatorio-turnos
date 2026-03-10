'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const COLOR_TURNO: Record<string, string> = {
  FRANCO:     'bg-green-100 text-green-800 border-green-300',
  FERIADO:    'bg-red-100 text-red-800 border-red-300',
  VACACIONES: 'bg-gray-100 text-gray-600 border-gray-300',
  LICENCIA:   'bg-yellow-100 text-yellow-700 border-yellow-300',
  NOCHE:      'bg-violet-100 text-violet-800 border-violet-300',
  TARDE:      'bg-orange-100 text-orange-800 border-orange-300',
  DEFAULT:    'bg-blue-100 text-blue-800 border-blue-300',
};

function colorDeGuardia(g: any): string {
  if (g.tipo === 'FRANCO') return COLOR_TURNO.FRANCO;
  if (g.tipo === 'FERIADO') return COLOR_TURNO.FERIADO;
  if (g.tipo === 'VACACIONES') return COLOR_TURNO.VACACIONES;
  if (g.tipo === 'LICENCIA') return COLOR_TURNO.LICENCIA;
  if (g.turnoNombre?.toLowerCase().includes('noche')) return COLOR_TURNO.NOCHE;
  if (g.turnoNombre?.toLowerCase().includes('tarde')) return COLOR_TURNO.TARDE;
  return COLOR_TURNO.DEFAULT;
}

export default function MiGrillaPage() {
  const { token, usuario } = useAuthStore();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [guardias, setGuardias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const personalId = (usuario as any)?.personalGuardia?.id || '';

  const cargar = useCallback(async () => {
    if (!token || !personalId) return;
    setLoading(true);
    try {
      const r: any = await api.get(`/guardias/personal/${personalId}?mes=${mes}&anio=${anio}`, token);
      setGuardias(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, personalId, mes, anio]);

  useEffect(() => { cargar(); }, [cargar]);

  const avanzar = (delta: number) => {
    let nm = mes + delta, na = anio;
    if (nm > 12) { nm = 1; na++; }
    if (nm < 1)  { nm = 12; na--; }
    setMes(nm); setAnio(na);
  };

  const diasEnMes = new Date(anio, mes, 0).getDate();
  const diasArr = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const guardiaMap = new Map(guardias.map(g => [new Date(g.fecha).getDate(), g]));

  // Próximas guardias (hoy en adelante)
  const hoy = new Date();
  const proximas = guardias
    .filter(g => new Date(g.fecha) >= hoy)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi grilla</h1>
        <p className="text-sm text-gray-500">{(usuario as any)?.nombre} {(usuario as any)?.apellido}</p>
      </div>

      {/* Próximas guardias */}
      {proximas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm">Próximas guardias</h2>
          <div className="flex gap-3 flex-wrap">
            {proximas.map(g => (
              <div key={g.id} className={`px-4 py-3 rounded-xl border font-medium text-sm ${colorDeGuardia(g)}`}>
                <div className="font-bold text-base">
                  {new Date(g.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </div>
                <div>{g.turnoNombre}</div>
                <div className="text-xs opacity-70">{g.horas}h</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navegación mes */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => avanzar(-1)} className="p-1 hover:bg-gray-200 rounded">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-gray-800 text-lg w-44 text-center">
          {MESES[mes - 1]} {anio}
        </span>
        <button onClick={() => avanzar(1)} className="p-1 hover:bg-gray-200 rounded">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendario simple */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
        ) : (
          <>
            {/* Cabecera días de semana */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
                <div key={d} className="text-xs text-gray-400 text-center font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Celdas del mes */}
            <div className="grid grid-cols-7 gap-1">
              {/* Espacios del inicio del mes */}
              {Array.from({ length: new Date(anio, mes - 1, 1).getDay() }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {diasArr.map(dia => {
                const g = guardiaMap.get(dia);
                const esHoy = new Date().getDate() === dia && new Date().getMonth() + 1 === mes && new Date().getFullYear() === anio;
                return (
                  <div
                    key={dia}
                    className={`rounded-lg p-1.5 min-h-[52px] border ${
                      esHoy ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-100'
                    } ${g ? colorDeGuardia(g) : 'bg-gray-50'}`}
                  >
                    <div className={`text-xs font-semibold mb-0.5 ${esHoy ? 'text-indigo-700' : 'text-gray-500'}`}>
                      {dia}
                    </div>
                    {g && (
                      <>
                        <div className="text-xs font-medium leading-tight truncate">{g.turnoNombre}</div>
                        {g.horas > 0 && <div className="text-[10px] opacity-70">{g.horas}h</div>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Resumen del mes */}
      {!loading && guardias.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { label: 'Guardias', value: guardias.filter(g => !['FRANCO','VACACIONES','LICENCIA'].includes(g.tipo)).length, color: 'text-blue-700' },
            { label: 'Francos', value: guardias.filter(g => g.tipo === 'FRANCO').length, color: 'text-green-700' },
            { label: 'Horas', value: `${guardias.reduce((s, g) => s + g.horas, 0)}h`, color: 'text-indigo-700' },
            { label: 'Feriados', value: guardias.filter(g => g.tipo === 'FERIADO').length, color: 'text-red-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
