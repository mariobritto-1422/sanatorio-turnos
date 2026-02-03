'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await api.login(email, password);

      if (response.success && response.data.usuario) {
        login(response.data.token, response.data.usuario);

        // Redirigir según el rol del usuario
        switch (response.data.usuario.rol) {
          case 'PACIENTE':
            router.push('/');
            break;
          case 'PROFESIONAL':
            router.push('/profesional/dashboard');
            break;
          case 'RECEPCION':
          case 'SUPERADMIN':
            router.push('/recepcion/dashboard');
            break;
          default:
            router.push('/');
        }
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err: any) {
      setError('Email o contraseña incorrectos. Verificá tus datos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido
          </h1>
          <p className="text-gray-600">
            Sistema de Gestión de Turnos
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           transition-colors"
                  placeholder="tu-email@ejemplo.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando || !email || !password}
              className="w-full flex items-center justify-center gap-2 px-6 py-3
                       bg-primary-500 hover:bg-primary-600
                       text-white font-semibold rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <LogIn className="w-5 h-5" />
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Credenciales de prueba */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            💡 Credenciales de prueba:
          </p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Paciente:</strong> juan.perez@email.com / Paciente123!</p>
            <p><strong>Recepción:</strong> recepcion@sanatorio.com / Recepcion123!</p>
            <p><strong>Profesional:</strong> garcia@sanatorio.com / Garcia123!</p>
            <p><strong>Admin:</strong> admin@sanatorio.com / Admin123!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
