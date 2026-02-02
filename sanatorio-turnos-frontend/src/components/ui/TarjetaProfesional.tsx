'use client';

import { User } from 'lucide-react';
import Image from 'next/image';

interface TarjetaProfesionalProps {
  profesional: {
    id: string;
    nombre: string;
    apellido: string;
    especialidad: string;
    foto?: string;
  };
  onClick: () => void;
}

export function TarjetaProfesional({
  profesional,
  onClick,
}: TarjetaProfesionalProps) {
  const nombreCompleto = `${profesional.nombre} ${profesional.apellido}`;

  return (
    <button
      onClick={onClick}
      className="card-profesional w-full"
      aria-label={`Elegir profesional ${nombreCompleto}, ${profesional.especialidad}`}
    >
      {/* Foto del profesional */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-primary-200">
        {profesional.foto ? (
          <Image
            src={profesional.foto}
            alt={nombreCompleto}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <User size={64} className="text-primary-600" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Nombre */}
      <div className="text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {nombreCompleto}
        </h3>
        <p className="text-xl sm:text-2xl text-gray-600 mt-2">
          {profesional.especialidad}
        </p>
      </div>
    </button>
  );
}
