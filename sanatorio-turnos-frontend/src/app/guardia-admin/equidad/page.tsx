'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function PanelEquidadPage() {
  const { token, usuario } = useAuthStore();
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sanatorioId = (usuario as any)?.sanatorioId || '';

  useEffect(() => {
    if (!token || !sanatorioId) return;
    setLoading(true);
    api.get(`/banco-horas/equidad?anio=${anio}&sanatorioId=${sanatorioId}`, token)
      .then((r: any) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, sanatorioId, anio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const personal: any[] = data?.personal || [];
  const promedioFindes = data?.promedioFindesTrabajados ?? 0;
  const promedioFeriados = data?.promedioFeriadosTrabajados ?? 0;

  const conAlerta = personal.filter(
    p => p.findesTrabajados > promedioFindes * 1.3 || p.feriadosTrabajados > promedioFeriados * 1.3
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de equidad</h1>
          <p className="text-sm text-gray-500">Distribución acumulada del año {anio}</p>
        </div>
        <select
          value={anio}
          onChange={e => setAnio(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          {[2024, 2025, 2026].map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Alertas */}
      {conAlerta.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2 font-medium text-yellow-800 mb-2">
            <AlertTriangle size={16} />
            {conAlerta.length} persona{conAlerta.length > 1 ? 's' : ''} por encima del promedio (&gt;30%)
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {conAlerta.map((p: any) => (
              <li key={p.id}>
                • {p.apellido}, {p.nombre}:
                {p.findesTrabajados > promedioFindes * 1.3 && ` ${p.findesTrabajados} fines de semana`}
                {p.feriadosTrabajados > promedioFeriados * 1.3 && ` ${p.feriadosTrabajados} feriados`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gráfico fines de semana */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-1">Fines de semana trabajados</h2>
        <p className="text-xs text-gray-400 mb-4">Promedio: {promedioFindes}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={personal} margin={{ left: -10 }}>
            <XAxis dataKey="apellido" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: any) => [`${v} fines de semana`, '']}
              labelFormatter={(l) => `${l}`}
            />
            <ReferenceLine y={promedioFindes} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Promedio', position: 'insideTopRight', fontSize: 11 }} />
            <Bar dataKey="findesTrabajados" fill="#818cf8" radius={[4, 4, 0, 0]} name="Fines de semana" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico feriados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-1">Feriados trabajados</h2>
        <p className="text-xs text-gray-400 mb-4">Promedio: {promedioFeriados}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={personal} margin={{ left: -10 }}>
            <XAxis dataKey="apellido" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => [`${v} feriados`, '']} />
            <ReferenceLine y={promedioFeriados} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Promedio', position: 'insideTopRight', fontSize: 11 }} />
            <Bar dataKey="feriadosTrabajados" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Feriados" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla completa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Personal</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Rol</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Findes</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Feriados</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Hs extra</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Francos pend.</th>
            </tr>
          </thead>
          <tbody>
            {personal.map((p: any, i: number) => {
              const alertaFinde   = p.findesTrabajados > promedioFindes * 1.3;
              const alertaFeriado = p.feriadosTrabajados > promedioFeriados * 1.3;
              return (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {p.apellido}, {p.nombre}
                    {(alertaFinde || alertaFeriado) && (
                      <AlertTriangle size={14} className="inline ml-2 text-yellow-500" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 capitalize">{p.rol.toLowerCase()}</td>
                  <td className={`px-4 py-2.5 text-center font-semibold ${alertaFinde ? 'text-red-600' : 'text-gray-700'}`}>
                    {p.findesTrabajados}
                  </td>
                  <td className={`px-4 py-2.5 text-center font-semibold ${alertaFeriado ? 'text-red-600' : 'text-gray-700'}`}>
                    {p.feriadosTrabajados}
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{p.horasExtra.toFixed(1)}h</td>
                  <td className="px-4 py-2.5 text-center text-gray-700">{p.francosPendientes.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
