'use client';

import { formatearHora } from '@/lib/utils';
import { Phone, FileText } from 'lucide-react';

interface TablaTurnosProps {
  turnos: any[];
  onClickTurno?: (turno: any) => void;
}

const estadoColors: Record<string, string> = {
  PENDIENTE: 'text-yellow-700 bg-yellow-50',
  CONFIRMADO: 'text-green-700 bg-green-50',
  EN_CURSO: 'text-blue-700 bg-blue-50',
  COMPLETADO: 'text-gray-700 bg-gray-50',
  CANCELADO_PACIENTE: 'text-red-700 bg-red-50',
  CANCELADO_PROFESIONAL: 'text-red-700 bg-red-50',
  AUSENTE: 'text-red-700 bg-red-50',
};

export function TablaTurnos({ turnos, onClickTurno }: TablaTurnosProps) {
  if (turnos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
        <p className="text-gray-500">No hay turnos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Hora
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Paciente
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Contacto
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Nota
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {turnos.map((turno) => (
            <tr
              key={turno.id}
              onClick={() => onClickTurno?.(turno)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {formatearHora(new Date(turno.fechaHora))}
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {turno.paciente.nombre} {turno.paciente.apellido}
                  </p>
                  {turno.paciente.obraSocial && (
                    <p className="text-xs text-gray-500">
                      {turno.paciente.obraSocial.nombre}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{turno.paciente.telefono}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-gray-700">{turno.tipo}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    estadoColors[turno.estado]
                  }`}
                >
                  {turno.estado.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3">
                {turno.notaSimple ? (
                  <div className="flex items-center gap-1 text-gray-500">
                    <FileText size={14} />
                    <span className="text-xs truncate max-w-[150px]">
                      {turno.notaSimple}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
