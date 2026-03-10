'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import GrillaMensual from '@/components/guardias/GrillaMensual';
import { ChevronLeft, ChevronRight, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function GrillaAdminPage() {
  const { token, usuario } = useAuthStore();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [guardias, setGuardias] = useState<any[]>([]);
  const [personal, setPersonal] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [area, setArea] = useState<string>('');
  const [advertenciasGenerar, setAdvertenciasGenerar] = useState<string[]>([]);

  // Obtener sanatorioId del usuario
  const sanatorioId = (usuario as any)?.sanatorioId || '';

  const cargar = useCallback(async () => {
    if (!token || !sanatorioId) return;
    setLoading(true);
    try {
      const params: any = { sanatorioId, mes, anio };
      if (area) params.area = area;

      const [rGuardias, rPersonal] = await Promise.all([
        api.get(`/guardias/grilla?${new URLSearchParams(params)}`, token),
        api.get(`/personal-guardia?sanatorioId=${sanatorioId}${area ? `&rol=${area}` : ''}`, token),
      ]);

      setGuardias((rGuardias as any).data || []);
      setPersonal((rPersonal as any).data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, sanatorioId, mes, anio, area]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleGenerar = async () => {
    if (!token || !sanatorioId) return;
    setGenerando(true);
    setAdvertenciasGenerar([]);
    try {
      const res: any = await api.post('/guardias/generar', { mes, anio, sanatorioId }, token);
      setAdvertenciasGenerar(res.data?.advertencias || []);
      await cargar();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerando(false);
    }
  };

  const avanzarMes = (delta: number) => {
    let nm = mes + delta;
    let na = anio;
    if (nm > 12) { nm = 1; na++; }
    if (nm < 1)  { nm = 12; na--; }
    setMes(nm);
    setAnio(na);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grilla de guardias</h1>
          <p className="text-sm text-gray-500">Generación y gestión del mes</p>
        </div>
        <button
          onClick={handleGenerar}
          disabled={generando}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 font-medium"
        >
          {generando ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Generar {MESES[mes - 1]} {anio}
        </button>
      </div>

      {/* Advertencias post-generación */}
      {advertenciasGenerar.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 font-medium text-yellow-800 mb-2">
            <AlertTriangle size={16} />
            {advertenciasGenerar.length} conflictos detectados — revisar celdas marcadas en naranja
          </div>
          <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
            {advertenciasGenerar.map((a, i) => <li key={i}>• {a}</li>)}
          </ul>
        </div>
      )}

      {/* Navegación de mes */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => avanzarMes(-1)} className="p-1 hover:bg-gray-200 rounded">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-gray-800 text-lg w-44 text-center">
          {MESES[mes - 1]} {anio}
        </span>
        <button onClick={() => avanzarMes(1)} className="p-1 hover:bg-gray-200 rounded">
          <ChevronRight size={20} />
        </button>

        <select
          value={area}
          onChange={e => setArea(e.target.value)}
          className="ml-4 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">Todos los roles</option>
          <option value="ENFERMERO">Enfermeros</option>
          <option value="MUCAMA">Mucamas</option>
        </select>

        <button onClick={cargar} className="ml-2 p-1 hover:bg-gray-200 rounded text-gray-500">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Grilla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : personal.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No hay personal registrado</p>
            <p className="text-sm mt-1">Agregue personal desde la configuración</p>
          </div>
        ) : (
          <GrillaMensual
            mes={mes}
            anio={anio}
            personal={personal}
            guardias={guardias}
            onAjusteManual={async (guardiaId, nuevoPersonalId, turnoNombre) => {
              await api.put(`/guardias/${guardiaId}`, { personalId: nuevoPersonalId, turnoNombre }, token!);
              await cargar();
            }}
          />
        )}
      </div>
    </div>
  );
}
