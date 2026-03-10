'use client';

import { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

export type TipoGuardia = 'NORMAL' | 'EXTRA' | 'FRANCO' | 'VACACIONES' | 'FERIADO' | 'LICENCIA';

interface Guardia {
  id: string;
  personalId: string;
  fecha: string;
  turnoNombre: string;
  tipo: TipoGuardia;
  horas: number;
  requiereRevision: boolean;
  personal: { nombre: string; apellido: string };
}

interface PersonalRow {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
}

interface Props {
  mes: number;
  anio: number;
  personal: PersonalRow[];
  guardias: Guardia[];
  onAjusteManual?: (guardiaId: string, nuevoPersonalId: string, turnoNombre: string) => Promise<void>;
  readOnly?: boolean;
}

const COLOR: Record<TipoGuardia, string> = {
  FRANCO:     'bg-green-100 text-green-800 border-green-200',
  NORMAL:     'bg-blue-100 text-blue-800 border-blue-200',
  EXTRA:      'bg-orange-100 text-orange-800 border-orange-200',
  NOCHE:      'bg-violet-100 text-violet-800 border-violet-200',
  FERIADO:    'bg-red-100 text-red-800 border-red-200',
  VACACIONES: 'bg-gray-100 text-gray-600 border-gray-200',
  LICENCIA:   'bg-yellow-100 text-yellow-700 border-yellow-200',
} as any;

const ETIQUETA: Record<TipoGuardia | string, string> = {
  FRANCO:     'F',
  NORMAL:     '',
  EXTRA:      'E',
  FERIADO:    'FER',
  VACACIONES: 'VAC',
  LICENCIA:   'LIC',
};

function colorGuardia(g: Guardia): string {
  if (g.tipo === 'FRANCO') return COLOR.FRANCO;
  if (g.tipo === 'FERIADO') return COLOR.FERIADO;
  if (g.tipo === 'VACACIONES') return COLOR.VACACIONES;
  if (g.tipo === 'LICENCIA') return COLOR.LICENCIA;
  if (g.turnoNombre.toLowerCase().includes('noche')) return (COLOR as any).NOCHE;
  if (g.turnoNombre.toLowerCase().includes('tarde')) return COLOR.EXTRA;
  return COLOR.NORMAL;
}

export default function GrillaMensual({ mes, anio, personal, guardias, onAjusteManual, readOnly }: Props) {
  const [modalGuardia, setModalGuardia] = useState<Guardia | null>(null);
  const [advertencias, setAdvertencias] = useState<string[]>([]);

  const diasEnMes = new Date(anio, mes, 0).getDate();
  const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);

  // Índice rápido: personalId + fecha => guardia
  const indice = new Map<string, Guardia[]>();
  for (const g of guardias) {
    const fecha = new Date(g.fecha).getDate();
    const key = `${g.personalId}-${fecha}`;
    if (!indice.has(key)) indice.set(key, []);
    indice.get(key)!.push(g);
  }

  const nombreDia = (dia: number) => {
    const d = new Date(anio, mes - 1, dia);
    return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][d.getDay()];
  };

  const esFinde = (dia: number) => {
    const d = new Date(anio, mes - 1, dia).getDay();
    return d === 0 || d === 6;
  };

  const abrirModal = (g: Guardia) => {
    if (readOnly) return;
    setModalGuardia(g);
    setAdvertencias([]);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white border-b border-r border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 min-w-[160px]">
              Personal
            </th>
            {dias.map(dia => (
              <th
                key={dia}
                className={`border-b border-r border-gray-200 px-1 py-2 text-center font-medium w-10 ${
                  esFinde(dia) ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-600'
                }`}
              >
                <div>{dia}</div>
                <div className="text-[10px] font-normal">{nombreDia(dia)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {personal.map((p, idx) => (
            <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="sticky left-0 z-10 bg-inherit border-b border-r border-gray-200 px-3 py-1.5 font-medium text-gray-800 whitespace-nowrap">
                {p.apellido}, {p.nombre}
                <span className="ml-1 text-[10px] text-gray-400 font-normal">{p.rol}</span>
              </td>
              {dias.map(dia => {
                const gs = indice.get(`${p.id}-${dia}`) || [];
                return (
                  <td
                    key={dia}
                    className={`border-b border-r border-gray-200 p-0.5 align-top ${
                      esFinde(dia) ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    {gs.map(g => (
                      <button
                        key={g.id}
                        onClick={() => abrirModal(g)}
                        title={`${g.turnoNombre} — ${g.tipo}${g.requiereRevision ? ' ⚠️ Requiere revisión' : ''}`}
                        className={`w-full text-center rounded border px-0.5 py-0.5 leading-tight ${colorGuardia(g)} ${
                          g.requiereRevision ? 'ring-2 ring-yellow-400' : ''
                        } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        <div className="font-semibold truncate">
                          {g.turnoNombre.slice(0, 1).toUpperCase()}
                        </div>
                        {ETIQUETA[g.tipo] && (
                          <div className="text-[9px]">{ETIQUETA[g.tipo]}</div>
                        )}
                        {g.requiereRevision && <AlertTriangle size={10} className="mx-auto text-yellow-500" />}
                      </button>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs">
        {[
          { label: 'Mañana',    color: 'bg-blue-100 text-blue-800' },
          { label: 'Tarde',     color: 'bg-orange-100 text-orange-800' },
          { label: 'Noche',     color: 'bg-violet-100 text-violet-800' },
          { label: 'Franco',    color: 'bg-green-100 text-green-800' },
          { label: 'Feriado',   color: 'bg-red-100 text-red-800' },
          { label: 'Vacaciones',color: 'bg-gray-100 text-gray-600' },
          { label: 'Licencia',  color: 'bg-yellow-100 text-yellow-700' },
        ].map(({ label, color }) => (
          <span key={label} className={`px-2 py-1 rounded border ${color}`}>{label}</span>
        ))}
        <span className="px-2 py-1 rounded border ring-2 ring-yellow-400 bg-white text-gray-700">
          ⚠️ Requiere revisión
        </span>
      </div>

      {/* Modal ajuste manual */}
      {modalGuardia && !readOnly && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Ajuste manual de guardia</h3>
              <button onClick={() => setModalGuardia(null)}><X size={20} /></button>
            </div>

            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <p><span className="font-medium">Personal:</span> {modalGuardia.personal.apellido}, {modalGuardia.personal.nombre}</p>
              <p><span className="font-medium">Fecha:</span> {new Date(modalGuardia.fecha).toLocaleDateString('es-AR')}</p>
              <p><span className="font-medium">Turno:</span> {modalGuardia.turnoNombre}</p>
              <p><span className="font-medium">Tipo:</span> {modalGuardia.tipo}</p>
            </div>

            {advertencias.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 font-medium text-sm mb-1">
                  <AlertTriangle size={16} />
                  Advertencias de equidad
                </div>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {advertencias.map((a, i) => <li key={i}>• {a}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalGuardia(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (onAjusteManual) {
                    await onAjusteManual(modalGuardia.id, modalGuardia.personalId, modalGuardia.turnoNombre);
                  }
                  setModalGuardia(null);
                }}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Check size={16} />
                Confirmar ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
