'use client';

export default function ConfiguracionPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Configuración del Sistema
      </h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Esta sección permite configurar:
        </p>
        <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
          <li>Horarios del sanatorio</li>
          <li>Duración default de turnos</li>
          <li>Mensajes de notificaciones</li>
          <li>Otros parámetros globales</li>
        </ul>
        <p className="text-yellow-700 text-sm mt-3">
          Implementación con formularios de configuración que guardan en la tabla "configuracion" de la BD.
        </p>
      </div>
    </div>
  );
}
