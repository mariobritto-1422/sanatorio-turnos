'use client';

export default function GestionObrasSocialesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Gestión de Obras Sociales
      </h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Esta sección permite administrar obras sociales (CRUD completo, marcar convenios activos/inactivos, notas sobre requisitos).
        </p>
        <p className="text-yellow-700 text-sm mt-2">
          Implementación similar a la gestión de pacientes con formularios específicos para obras sociales.
        </p>
      </div>
    </div>
  );
}
