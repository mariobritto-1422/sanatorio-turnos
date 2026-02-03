'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { BotonGigante } from '@/components/ui/BotonGigante';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Por ahora, login simple con código de paciente
      // En producción, esto podría ser DNI, código QR, etc.
      const email = `${codigo}@email.com`; // Formato coincidente con backend
      const password = 'Paciente123!'; // En producción: usar código o pin

      const response = await api.login(email, password);

      if (response.success && response.data.usuario.rol === 'PACIENTE') {
        login(response.data.token, response.data.usuario);
        router.push('/');
      } else {
        setError('Este acceso es solo para pacientes');
      }
    } catch (err: any) {
      setError('Código incorrecto. Consultá en recepción.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
      <div className="container-paciente max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Bienvenido
          </h1>
          <p className="text-2xl text-gray-600">
            Ingresá tu código de paciente
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input del código */}
          <div>
            <label
              htmlFor="codigo"
              className="block text-2xl font-semibold text-gray-900 mb-3"
            >
              Tu código
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-6 py-6 text-3xl text-center font-bold
                         border-4 border-gray-300 rounded-xl
                         focus:border-primary-500 focus:ring-4 focus:ring-primary-200
                         transition-all duration-200"
              placeholder="12345"
              required
              autoFocus
            />
            <p className="mt-3 text-lg text-gray-600 text-center">
              Si no tenés código, pedilo en recepción
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-danger-50 border-2 border-danger-300 rounded-xl">
              <p className="text-xl text-danger-800 text-center font-semibold">
                {error}
              </p>
            </div>
          )}

          {/* Botón de ingresar */}
          <BotonGigante
            type="submit"
            icon={LogIn}
            variant="primary"
            disabled={cargando || !codigo}
          >
            {cargando ? 'INGRESANDO...' : 'INGRESAR'}
          </BotonGigante>
        </form>

        {/* Nota de ayuda */}
        <div className="mt-12 p-6 bg-primary-50 rounded-xl border-2 border-primary-200">
          <p className="text-xl text-center text-gray-700">
            💡 Podés usar el código de prueba: <strong>juan.perez</strong>
          </p>
        </div>
      </div>
    </main>
  );
}
