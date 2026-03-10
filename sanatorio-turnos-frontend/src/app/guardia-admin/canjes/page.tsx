'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Check, X, ArrowLeftRight, Loader2 } from 'lucide-react';

export default function CanjesPendientesPage() {
  const { token, usuario } = useAuthStore();
  const [canjes, setCanjes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [rechazando, setRechazando] = useState<string | null>(null);

  const sanatorioId = (usuario as any)?.sanatorioId || '';

  const cargar = async () => {
    if (!token || !sanatorioId) return;
    setLoading(true);
    try {
      const r: any = await api.get(`/canjes/pendientes?sanatorioId=${sanatorioId}`, token);
      setCanjes(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, [token, sanatorioId]);

  const aprobar = async (id: string) => {
    setProcesando(id);
    try {
      await api.put(`/canjes/${id}/aprobar`, {}, token!);
      await cargar();
    } catch (e: any) { alert(e.message); }
    finally { setProcesando(null); }
  };

  const rechazar = async (id: string) => {
    setProcesando(id);
    try {
      await api.put(`/canjes/${id}/rechazar`, { motivoRechazo }, token!);
      setRechazando(null);
      setMotivoRechazo('');
      await cargar();
    } catch (e: any) { alert(e.message); }
    finally { setProcesando(null); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Canjes pendientes</h1>
        <p className="text-sm text-gray-500">Solicitudes de intercambio de guardia que esperan aprobación</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
      ) : canjes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No hay canjes pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {canjes.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-gray-900">
                      {c.solicitante.apellido}, {c.solicitante.nombre}
                    </span>
                    <ArrowLeftRight size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      {c.receptor.apellido}, {c.receptor.nombre}
                    </span>
                    <span className="text-xs text-gray-400 capitalize ml-1">({c.solicitante.rol.toLowerCase()})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-500 font-medium mb-1">Ofrece</p>
                      <p className="font-semibold text-blue-900">
                        {new Date(c.guardiaOfrecida.fecha).toLocaleDateString('es-AR')}
                      </p>
                      <p className="text-blue-700">{c.guardiaOfrecida.turnoNombre}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-500 font-medium mb-1">Quiere</p>
                      <p className="font-semibold text-green-900">
                        {new Date(c.guardiaDeseada.fecha).toLocaleDateString('es-AR')}
                      </p>
                      <p className="text-green-700">{c.guardiaDeseada.turnoNombre}</p>
                    </div>
                  </div>

                  {c.motivo && (
                    <p className="text-sm text-gray-500 mt-3">
                      <span className="font-medium">Motivo:</span> {c.motivo}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => aprobar(c.id)}
                    disabled={procesando === c.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm font-medium"
                  >
                    {procesando === c.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Aprobar
                  </button>
                  <button
                    onClick={() => setRechazando(c.id)}
                    disabled={procesando === c.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium"
                  >
                    <X size={14} />
                    Rechazar
                  </button>
                </div>
              </div>

              {/* Formulario de rechazo */}
              {rechazando === c.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <textarea
                    placeholder="Motivo del rechazo (opcional)"
                    value={motivoRechazo}
                    onChange={e => setMotivoRechazo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rechazar(c.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Confirmar rechazo
                    </button>
                    <button
                      onClick={() => setRechazando(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
