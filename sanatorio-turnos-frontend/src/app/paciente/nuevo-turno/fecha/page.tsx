'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { BotonGigante } from '@/components/ui/BotonGigante';
import { Loading } from '@/components/ui/Loading';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { formatearFecha, formatearHora, getDiasDelMes, esPasado } from '@/lib/utils';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

function FechaHoraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isAuthenticated, usuario } = useAuthStore();

  const profesionalId = searchParams.get('profesional');

  const [profesional, setProfesional] = useState<any>(null);
  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(
    null
  );
  const [cargando, setCargando] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !profesionalId) {
      router.push('/');
      return;
    }

    cargarProfesional();
  }, [isAuthenticated, profesionalId, router]);

  const cargarProfesional = async () => {
    try {
      setCargando(true);
      const response = await api.getProfesional(profesionalId!, token!);

      if (response.success) {
        setProfesional(response.data);
      }
    } catch (err) {
      setError('No se pudo cargar el profesional');
    } finally {
      setCargando(false);
    }
  };

  const cargarDisponibilidad = async (fecha: Date) => {
    try {
      setCargandoHorarios(true);
      setHorarioSeleccionado(null);
      const fechaStr = format(fecha, 'yyyy-MM-dd');

      const response = await api.getDisponibilidad(
        profesionalId!,
        fechaStr,
        token!
      );

      if (response.success) {
        setHorariosDisponibles(response.data.disponibles);
      }
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const handleSeleccionarDia = (dia: Date) => {
    if (esPasado(dia)) return;
    setDiaSeleccionado(dia);
    cargarDisponibilidad(dia);
  };

  const handleConfirmar = async () => {
    if (!diaSeleccionado || !horarioSeleccionado || !usuario?.paciente) return;

    try {
      setCargando(true);

      const response = await api.createTurno(
        {
          pacienteId: usuario.paciente.id,
          profesionalId: profesionalId,
          fechaHora: horarioSeleccionado,
          tipo: 'PRIMERA_VEZ',
        },
        token!
      );

      if (response.success) {
        router.push('/paciente/nuevo-turno/confirmacion');
      }
    } catch (err: any) {
      alert(err.message || 'No se pudo crear el turno');
    } finally {
      setCargando(false);
    }
  };

  const mesAnterior = () => {
    setMesActual(subMonths(mesActual, 1));
    setDiaSeleccionado(null);
    setHorariosDisponibles([]);
  };

  const mesSiguiente = () => {
    setMesActual(addMonths(mesActual, 1));
    setDiaSeleccionado(null);
    setHorariosDisponibles([]);
  };

  const dias = getDiasDelMes(mesActual.getFullYear(), mesActual.getMonth());

  if (!isAuthenticated) return null;

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header titulo="Elegir Fecha y Hora" mostrarVolver />
        <Loading mensaje="Cargando..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header titulo="Elegir Fecha y Hora" mostrarVolver />

      <div className="container-paciente max-w-4xl">
        {/* Info del profesional */}
        {profesional && (
          <div className="mb-8 p-6 bg-white rounded-xl border-2 border-primary-200">
            <p className="text-xl text-gray-600">Turno con:</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {profesional.nombre} {profesional.apellido}
            </p>
            <p className="text-xl text-gray-600">{profesional.especialidad}</p>
          </div>
        )}

        {/* Selector de mes */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={mesAnterior}
            className="p-4 bg-white rounded-xl border-2 border-gray-300
                       hover:bg-gray-50 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={32} />
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center flex-1">
            {format(mesActual, 'MMMM yyyy', { locale: es })}
          </h2>

          <button
            onClick={mesSiguiente}
            className="p-4 bg-white rounded-xl border-2 border-gray-300
                       hover:bg-gray-50 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Calendario (días) */}
        <div className="mb-8">
          <p className="text-2xl font-semibold text-gray-700 mb-4">
            Seleccioná un día:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {dias.map((dia) => {
              const isPasado = esPasado(dia);
              const isSeleccionado =
                diaSeleccionado?.toDateString() === dia.toDateString();

              return (
                <button
                  key={dia.toISOString()}
                  onClick={() => handleSeleccionarDia(dia)}
                  disabled={isPasado}
                  className={`
                    ${
                      isSeleccionado
                        ? 'btn-calendario-selected'
                        : isPasado
                        ? 'btn-calendario-disabled'
                        : 'btn-calendario'
                    }
                  `}
                  aria-label={formatearFecha(dia)}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">{dia.getDate()}</div>
                    <div className="text-sm">
                      {format(dia, 'EEE', { locale: es })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horarios disponibles */}
        {diaSeleccionado && (
          <div className="mb-8">
            <p className="text-2xl font-semibold text-gray-700 mb-4">
              Horarios disponibles:
            </p>

            {cargandoHorarios ? (
              <Loading mensaje="Cargando horarios..." />
            ) : horariosDisponibles.length === 0 ? (
              <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <p className="text-xl text-yellow-800 text-center">
                  No hay horarios disponibles para este día
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {horariosDisponibles.map((horario) => {
                  const isSeleccionado = horarioSeleccionado === horario;

                  return (
                    <button
                      key={horario}
                      onClick={() => setHorarioSeleccionado(horario)}
                      className={
                        isSeleccionado
                          ? 'btn-calendario-selected'
                          : 'btn-calendario'
                      }
                      aria-label={formatearHora(new Date(horario))}
                    >
                      <span className="text-2xl font-bold">
                        {formatearHora(new Date(horario))}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Botón confirmar */}
        {horarioSeleccionado && (
          <div className="sticky bottom-0 bg-white p-4 border-t-4 border-primary-500 -mx-4">
            <BotonGigante
              icon={CalendarCheck}
              variant="success"
              onClick={handleConfirmar}
              disabled={cargando}
            >
              {cargando ? 'CONFIRMANDO...' : 'CONFIRMAR TURNO'}
            </BotonGigante>
          </div>
        )}
      </div>
    </main>
  );
}

export default function FechaHoraPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <Header titulo="Elegir Fecha y Hora" mostrarVolver />
        <Loading mensaje="Cargando..." />
      </main>
    }>
      <FechaHoraContent />
    </Suspense>
  );
}
