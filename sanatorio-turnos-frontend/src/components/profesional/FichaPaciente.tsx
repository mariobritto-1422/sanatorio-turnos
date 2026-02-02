'use client';

import { X, User, Phone, Mail, Calendar, Building2, FileText } from 'lucide-react';
import { formatearFecha } from '@/lib/utils';

interface FichaPacienteProps {
  paciente: {
    id: string;
    dni: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    genero: string;
    telefono: string;
    email?: string;
    obraSocial?: {
      nombre: string;
    };
    numeroAfiliado?: string;
    observacionesMedicas?: string;
  };
  turnos?: any[];
  onClose: () => void;
  onAgregarNota?: () => void;
}

export function FichaPaciente({
  paciente,
  turnos = [],
  onClose,
  onAgregarNota,
}: FichaPacienteProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <User size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <p className="text-sm text-gray-500">DNI: {paciente.dni}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Datos Personales */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-medium text-gray-900">
                    {formatearFecha(new Date(paciente.fechaNacimiento))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Género</p>
                  <p className="font-medium text-gray-900">{paciente.genero}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900">{paciente.telefono}</p>
                </div>
              </div>

              {paciente.email && (
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{paciente.email}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Obra Social */}
          {paciente.obraSocial && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cobertura
              </h3>
              <div className="flex items-start gap-3">
                <Building2 size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Obra Social</p>
                  <p className="font-medium text-gray-900">
                    {paciente.obraSocial.nombre}
                  </p>
                  {paciente.numeroAfiliado && (
                    <p className="text-sm text-gray-600">
                      N° Afiliado: {paciente.numeroAfiliado}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Observaciones Médicas */}
          {paciente.observacionesMedicas && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Observaciones Médicas
              </h3>
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-900">
                      {paciente.observacionesMedicas}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Historial de Turnos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Historial de Turnos
              </h3>
              {onAgregarNota && (
                <button
                  onClick={onAgregarNota}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg
                             hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  Agregar Nota
                </button>
              )}
            </div>

            {turnos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay turnos registrados
              </p>
            ) : (
              <div className="space-y-3">
                {turnos.slice(0, 10).map((turno: any) => (
                  <div
                    key={turno.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatearFecha(new Date(turno.fechaHora))}
                        </p>
                        <p className="text-sm text-gray-600">{turno.tipo}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          turno.estado === 'COMPLETADO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {turno.estado}
                      </span>
                    </div>
                    {turno.notaSimple && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                        {turno.notaSimple}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
                       hover:bg-gray-300 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
