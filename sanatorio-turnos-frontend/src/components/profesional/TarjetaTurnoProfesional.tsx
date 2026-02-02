'use client';

import { Calendar, Clock, FileText, Phone } from 'lucide-react';
import { formatearHora } from '@/lib/utils';

interface TarjetaTurnoProfesionalProps {
  turno: {
    id: string;
    fechaHora: string;
    estado: string;
    tipo: string;
    paciente: {
      nombre: string;
      apellido: string;
      telefono: string;
      obraSocial?: {
        nombre: string;
      };
    };
    notaSimple?: string;
  };
  onClick?: () => void;
}

const estadoColors: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMADO: 'bg-green-100 text-green-800 border-green-300',
  EN_CURSO: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETADO: 'bg-gray-100 text-gray-800 border-gray-300',
  CANCELADO_PACIENTE: 'bg-red-100 text-red-800 border-red-300',
  CANCELADO_PROFESIONAL: 'bg-red-100 text-red-800 border-red-300',
  AUSENTE: 'bg-red-100 text-red-800 border-red-300',
};

const tipoLabels: Record<string, string> = {
  PRIMERA_VEZ: 'Primera vez',
  CONTROL: 'Control',
  URGENCIA: 'Urgencia',
};

export function TarjetaTurnoProfesional({
  turno,
  onClick,
}: TarjetaTurnoProfesionalProps) {
  const hora = formatearHora(new Date(turno.fechaHora));

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-lg border-2 border-gray-200
                 hover:border-primary-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Hora */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Clock size={18} className="text-primary-600" />
          <span className="font-bold text-lg text-gray-900">{hora}</span>
        </div>

        {/* Estado */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            estadoColors[turno.estado]
          }`}
        >
          {turno.estado.replace('_', ' ')}
        </span>
      </div>

      {/* Paciente */}
      <div className="mt-3">
        <p className="font-semibold text-gray-900">
          {turno.paciente.nombre} {turno.paciente.apellido}
        </p>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Phone size={14} />
            <span>{turno.paciente.telefono}</span>
          </div>
          {turno.paciente.obraSocial && (
            <span className="text-xs">· {turno.paciente.obraSocial.nombre}</span>
          )}
        </div>
      </div>

      {/* Tipo y nota */}
      <div className="mt-2 flex items-center gap-3 text-sm">
        <span className="text-primary-600 font-medium">
          {tipoLabels[turno.tipo]}
        </span>
        {turno.notaSimple && (
          <div className="flex items-center gap-1 text-gray-500">
            <FileText size={14} />
            <span className="truncate max-w-[200px]">{turno.notaSimple}</span>
          </div>
        )}
      </div>
    </button>
  );
}
