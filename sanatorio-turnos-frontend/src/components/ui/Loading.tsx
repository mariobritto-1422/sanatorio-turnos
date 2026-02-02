'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  mensaje?: string;
}

export function Loading({ mensaje = 'Cargando...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2
        size={64}
        className="text-primary-500 animate-spin"
        strokeWidth={2.5}
      />
      <p className="text-2xl font-semibold text-gray-700">{mensaje}</p>
    </div>
  );
}
