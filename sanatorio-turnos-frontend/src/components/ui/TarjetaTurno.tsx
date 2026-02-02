'use client';

import { Calendar, Clock, User, Building2 } from 'lucide-react';
import { formatearFecha, formatearHora } from '@/lib/utils';

interface TarjetaTurnoProps {
  turno: {
    id: string;
    fechaHora: string;
    estado: string;
    profesional: {
      nombre: string;
      apellido: string;
      especialidad: string;
    };
    obraSocial?: {
      nombre: string;
    };
  };
  onCancelar?: () => void;
}

const estadoLabels: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_CURSO: 'En curso',
  COMPLETADO: 'Completado',
  CANCELADO_PACIENTE: 'Cancelado',
  CANCELADO_PROFESIONAL: 'Cancelado por profesional',
  AUSENTE: 'Ausente',
};

const estadoColors: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMADO: 'bg-green-100 text-green-800 border-green-300',
  EN_CURSO: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETADO: 'bg-gray-100 text-gray-800 border-gray-300',
  CANCELADO_PACIENTE: 'bg-red-100 text-red-800 border-red-300',
  CANCELADO_PROFESIONAL: 'bg-red-100 text-red-800 border-red-300',
  AUSENTE: 'bg-red-100 text-red-800 border-red-300',
};

export function TarjetaTurno({ turno, onCancelar }: TarjetaTurnoProps) {
  const fecha = new Date(turno.fechaHora);
  const nombreProfesional = `${turno.profesional.nombre} ${turno.profesional.apellido}`;

  const puedeCancelar = ['PENDIENTE', 'CONFIRMADO'].includes(turno.estado);

  return (
    <div className="card-turno">
      {/* Estado */}
      <div
        className={`inline-flex self-start px-4 py-2 rounded-full text-lg font-semibold border-2 ${
          estadoColors[turno.estado]
        }`}
      >
        {estadoLabels[turno.estado]}
      </div>

      {/* Información del turno */}
      <div className="space-y-3">
        {/* Fecha */}
        <div className="flex items-start gap-3">
          <Calendar size={32} className="text-primary-600 flex-shrink-0" />
          <div>
            <p className="text-xl font-semibold text-gray-900">
              {formatearFecha(fecha)}
            </p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start gap-3">
          <Clock size={32} className="text-primary-600 flex-shrink-0" />
          <div>
            <p className="text-xl font-semibold text-gray-900">
              {formatearHora(fecha)}
            </p>
          </div>
        </div>

        {/* Profesional */}
        <div className="flex items-start gap-3">
          <User size={32} className="text-primary-600 flex-shrink-0" />
          <div>
            <p className="text-xl font-semibold text-gray-900">
              {nombreProfesional}
            </p>
            <p className="text-lg text-gray-600">{turno.profesional.especialidad}</p>
          </div>
        </div>

        {/* Obra Social */}
        {turno.obraSocial && (
          <div className="flex items-start gap-3">
            <Building2 size={32} className="text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {turno.obraSocial.nombre}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botón cancelar */}
      {puedeCancelar && onCancelar && (
        <button
          onClick={onCancelar}
          className="mt-4 w-full py-4 px-6 text-lg font-semibold text-danger-600
                     bg-danger-50 hover:bg-danger-100 rounded-xl border-2 border-danger-200
                     transition-colors duration-200"
          aria-label={`Cancelar turno del ${formatearFecha(fecha)}`}
        >
          Cancelar Turno
        </button>
      )}
    </div>
  );
}
