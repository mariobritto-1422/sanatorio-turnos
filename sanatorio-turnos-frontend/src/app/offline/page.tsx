import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-6 bg-red-100 rounded-full">
            <WifiOff className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sin Conexión</h1>

        <p className="text-gray-600 mb-6">
          No tienes conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
        >
          Reintentar
        </button>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Algunas funciones pueden estar disponibles sin conexión si ya
            las visitaste anteriormente.
          </p>
        </div>
      </div>
    </div>
  );
}
