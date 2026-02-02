'use client';

export default function GestionProfesionalesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Gestión de Profesionales
      </h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Esta sección permite administrar profesionales (alta/baja, configurar horarios, asignar especialidades).
        </p>
        <p className="text-yellow-700 text-sm mt-2">
          Se puede implementar reutilizando componentes de la interfaz de profesionales con permisos de edición.
        </p>
      </div>
    </div>
  );
}
