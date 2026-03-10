'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Clock, TrendingUp, TrendingDown, Calendar, Star, Loader2 } from 'lucide-react';

export default function MiBancoHorasPage() {
  const { token, usuario } = useAuthStore();
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const personalId = (usuario as any)?.personalGuardia?.id || '';

  useEffect(() => {
    if (!token || !personalId) return;
    setLoading(true);
    api.get(`/banco-horas/${personalId}`, token)
      .then((r: any) => setHistorial(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, personalId]);

  const ultimo = historial[0];
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi banco de horas</h1>
        <p className="text-sm text-gray-500">Historial acumulado y estado actual</p>
      </div>

      {/* Estado actual (último mes) */}
      {ultimo && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <MetricaCard
              icon={<Clock size={20} className="text-indigo-500" />}
              label="Horas trabajadas"
              value={`${ultimo.horasTrabajadas}h`}
              sub={`Contrato: ${ultimo.horasContrato.toFixed(0)}h`}
              color="bg-indigo-50"
            />
            <MetricaCard
              icon={<TrendingUp size={20} className="text-green-500" />}
              label="Horas extra"
              value={`+${ultimo.horasExtra}h`}
              sub={`${ultimo.francosPendientes.toFixed(1)} francos pendientes`}
              color="bg-green-50"
            />
            <MetricaCard
              icon={<TrendingDown size={20} className="text-red-500" />}
              label="Horas adeudadas"
              value={`-${ultimo.horasDeuda}h`}
              sub="A recuperar"
              color="bg-red-50"
            />
            <MetricaCard
              icon={<Calendar size={20} className="text-orange-500" />}
              label="Fines de semana (año)"
              value={ultimo.findesTrabajados}
              sub="Acumulados en el año"
              color="bg-orange-50"
            />
            <MetricaCard
              icon={<Star size={20} className="text-yellow-500" />}
              label="Feriados (año)"
              value={ultimo.feriadosTrabajados}
              sub="Acumulados en el año"
              color="bg-yellow-50"
            />
          </div>
        </>
      )}

      {/* Historial mensual */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Historial mensual</h2>
        </div>
        {historial.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Sin datos disponibles</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Período</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Contrato</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Trabajadas</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Extra</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Deuda</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Francos pend.</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {MESES[h.mes - 1]} {h.anio}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{h.horasContrato.toFixed(0)}h</td>
                  <td className="px-4 py-3 text-center text-gray-700 font-medium">{h.horasTrabajadas}h</td>
                  <td className={`px-4 py-3 text-center font-semibold ${h.horasExtra > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {h.horasExtra > 0 ? `+${h.horasExtra}h` : '—'}
                  </td>
                  <td className={`px-4 py-3 text-center font-semibold ${h.horasDeuda > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {h.horasDeuda > 0 ? `-${h.horasDeuda}h` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{h.francosPendientes.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MetricaCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-4 border border-gray-200`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}
