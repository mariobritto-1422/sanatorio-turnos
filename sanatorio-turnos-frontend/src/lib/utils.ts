import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Formatear fecha en español
export function formatearFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Formatear hora
export function formatearHora(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Formatear fecha y hora juntas
export function formatearFechaHora(fecha: Date | string): string {
  return `${formatearFecha(fecha)} a las ${formatearHora(fecha)}`;
}

// Obtener días del mes
export function getDiasDelMes(year: number, month: number): Date[] {
  const dias: Date[] = [];
  const primerDia = new Date(year, month, 1);
  const ultimoDia = new Date(year, month + 1, 0);

  for (let dia = primerDia.getDate(); dia <= ultimoDia.getDate(); dia++) {
    dias.push(new Date(year, month, dia));
  }

  return dias;
}

// Verificar si es hoy
export function esHoy(fecha: Date): boolean {
  const hoy = new Date();
  return (
    fecha.getDate() === hoy.getDate() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear()
  );
}

// Verificar si es pasado
export function esPasado(fecha: Date): boolean {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy;
}
