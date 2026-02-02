'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  titulo: string;
  mostrarVolver?: boolean;
  onVolver?: () => void;
}

export function Header({ titulo, mostrarVolver = false, onVolver }: HeaderProps) {
  const router = useRouter();

  const handleVolver = () => {
    if (onVolver) {
      onVolver();
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-white border-b-4 border-primary-500 mb-6 sticky top-0 z-10">
      <div className="container-paciente">
        <div className="flex items-center gap-4 py-4">
          {mostrarVolver && (
            <button
              onClick={handleVolver}
              className="flex-shrink-0 p-3 rounded-xl bg-gray-100 hover:bg-gray-200
                         transition-colors duration-200"
              aria-label="Volver a la pantalla anterior"
            >
              <ArrowLeft size={32} className="text-gray-700" strokeWidth={2.5} />
            </button>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex-1">
            {titulo}
          </h1>
        </div>
      </div>
    </header>
  );
}
