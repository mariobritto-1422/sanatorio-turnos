'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { ArrowLeftRight, Plus, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  APROBADO:  'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-800',
};

const ESTADO_ICON: Record<string, React.ReactNode> = {
  PENDIENTE: <Clock size={14} />,
  APROBADO:  <CheckCircle size={14} />,
  RECHAZADO: <XCircle size={14} />,
};

export default function MisCanjesPage() {
  const { token, usuario } = useAuthStore();
  const [historial, setHistorial] = useState<any[]>([]);
  const [guardias, setGuardias] = useState<any[]>([]); // mis guardias disponibles para ofrecer
  const [companeros, setCompaneros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Formulario solicitud
  const [receptorId, setReceptorId] = useState('');
  const [guardiaOfrecidaId, setGuardiaOfrecidaId] = useState('');
  const [guardiaDeseadaId, setGuardiaDeseadaId] = useState('');
  const [guardiasReceptor, setGuardiasReceptor] = useState<any[]>([]);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const personalId = (usuario as any)?.personalGuardia?.id || '';
  const sanatorioId = (usuario as any)?.sanatorioId || '';

  const cargar = async () => {
    if (!token || !personalId) return;
    setLoading(true);
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    try {
      const [rHistorial, rGuardias, rCompaneros] = await Promise.all([
        api.get(`/canjes/historial/${personalId}`, token),
        api.get(`/guardias/personal/${personalId}?mes=${mes}&anio=${anio}`, token),
        api.get(`/personal-guardia?sanatorioId=${sanatorioId}&rol=${(usuario as any)?.rol}`, token),
      ]);
      setHistorial((rHistorial as any).data || []);
      setGuardias(((rGuardias as any).data || []).filter((g: any) => !['FRANCO','VACACIONES','LICENCIA'].includes(g.tipo)));
      setCompaneros(((rCompaneros as any).data || []).filter((p: any) => p.id !== personalId));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, [token, personalId]);

  const cargarGuardiasReceptor = async (id: string) => {
    if (!id || !token) return;
    const hoy = new Date();
    const r: any = await api.get(`/guardias/personal/${id}?mes=${hoy.getMonth() + 1}&anio=${hoy.getFullYear()}`, token);
    setGuardiasReceptor((r.data || []).filter((g: any) => !['FRANCO','VACACIONES','LICENCIA'].includes(g.tipo)));
  };

  const solicitar = async () => {
    if (!guardiaOfrecidaId || !guardiaDeseadaId || !receptorId) {
      alert('Completá todos los campos');
      return;
    }
    setEnviando(true);
    try {
      await api.post('/canjes/solicitar', {
        solicitanteId: personalId,
        receptorId,
        guardiaOfrecidaId,
        guardiaDeseadaId,
        motivo,
      }, token!);
      setMostrarForm(false);
      setReceptorId(''); setGuardiaOfrecidaId(''); setGuardiaDeseadaId(''); setMotivo('');
      await cargar();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis canjes</h1>
          <p className="text-sm text-gray-500">Solicitudes enviadas y recibidas</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus size={16} />
          Solicitar canje
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Nueva solicitud de canje</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Con quién querés canjear?</label>
              <select
                value={receptorId}
                onChange={e => { setReceptorId(e.target.value); cargarGuardiasReceptor(e.target.value); setGuardiaDeseadaId(''); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Seleccionar compañero/a</option>
                {companeros.map(c => (
                  <option key={c.id} value={c.id}>{c.apellido}, {c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardia que ofrezco</label>
                <select
                  value={guardiaOfrecidaId}
                  onChange={e => setGuardiaOfrecidaId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar</option>
                  {guardias.map(g => (
                    <option key={g.id} value={g.id}>
                      {new Date(g.fecha).toLocaleDateString('es-AR')} — {g.turnoNombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardia que quiero</label>
                <select
                  value={guardiaDeseadaId}
                  onChange={e => setGuardiaDeseadaId(e.target.value)}
                  disabled={!receptorId}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="">Seleccionar</option>
                  {guardiasReceptor.map(g => (
                    <option key={g.id} value={g.id}>
                      {new Date(g.fecha).toLocaleDateString('es-AR')} — {g.turnoNombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
              <input
                type="text"
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Ej: compromiso familiar"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={solicitar}
                disabled={enviando}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 text-sm font-medium"
              >
                {enviando ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
                Enviar solicitud
              </button>
              <button onClick={() => setMostrarForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
      ) : historial.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-40" />
          <p>No tenés canjes registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((c: any) => {
            const soyElSolicitante = c.solicitanteId === personalId;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLOR[c.estado]}`}>
                      {ESTADO_ICON[c.estado]}
                      {c.estado.charAt(0) + c.estado.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {soyElSolicitante ? 'Enviado' : 'Recibido'} • {new Date(c.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-blue-50 rounded-lg flex-1 text-center">
                    <div className="text-xs text-blue-500">{soyElSolicitante ? 'Ofrezco' : `Ofrece ${c.solicitante.apellido}`}</div>
                    <div className="font-semibold">{new Date(c.guardiaOfrecida.fecha).toLocaleDateString('es-AR')}</div>
                    <div className="text-xs">{c.guardiaOfrecida.turnoNombre}</div>
                  </div>
                  <ArrowLeftRight size={16} className="text-gray-400 shrink-0" />
                  <div className="p-2 bg-green-50 rounded-lg flex-1 text-center">
                    <div className="text-xs text-green-500">{soyElSolicitante ? `Quiero de ${c.receptor.apellido}` : 'Quiere la mía'}</div>
                    <div className="font-semibold">{new Date(c.guardiaDeseada.fecha).toLocaleDateString('es-AR')}</div>
                    <div className="text-xs">{c.guardiaDeseada.turnoNombre}</div>
                  </div>
                </div>
                {c.motivoRechazo && (
                  <p className="text-xs text-red-500 mt-2">Motivo de rechazo: {c.motivoRechazo}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
