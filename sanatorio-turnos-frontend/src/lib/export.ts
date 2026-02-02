import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// EXPORTAR A EXCEL/CSV
// ============================================

export const exportarTurnosExcel = (turnos: any[], nombreArchivo: string) => {
  // Preparar datos
  const datos = turnos.map((turno) => ({
    Fecha: format(new Date(turno.fechaHora), 'dd/MM/yyyy', { locale: es }),
    Hora: format(new Date(turno.fechaHora), 'HH:mm'),
    Paciente: `${turno.paciente.apellido}, ${turno.paciente.nombre}`,
    DNI: turno.paciente.dni,
    Profesional: `${turno.profesional.apellido}, ${turno.profesional.nombre}`,
    'Obra Social': turno.obraSocial?.nombre || 'Sin obra social',
    Estado: turno.estado,
    Tipo: turno.tipo,
  }));

  // Crear libro de Excel
  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datos);

  // Ajustar ancho de columnas
  const anchosColumnas = [
    { wch: 12 }, // Fecha
    { wch: 8 },  // Hora
    { wch: 25 }, // Paciente
    { wch: 10 }, // DNI
    { wch: 25 }, // Profesional
    { wch: 20 }, // Obra Social
    { wch: 15 }, // Estado
    { wch: 12 }, // Tipo
  ];
  hoja['!cols'] = anchosColumnas;

  XLSX.utils.book_append_sheet(libro, hoja, 'Turnos');

  // Descargar
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
};

export const exportarTurnosCSV = (turnos: any[], nombreArchivo: string) => {
  const datos = turnos.map((turno) => ({
    Fecha: format(new Date(turno.fechaHora), 'dd/MM/yyyy', { locale: es }),
    Hora: format(new Date(turno.fechaHora), 'HH:mm'),
    Paciente: `${turno.paciente.apellido}, ${turno.paciente.nombre}`,
    DNI: turno.paciente.dni,
    Profesional: `${turno.profesional.apellido}, ${turno.profesional.nombre}`,
    'Obra Social': turno.obraSocial?.nombre || 'Sin obra social',
    Estado: turno.estado,
    Tipo: turno.tipo,
  }));

  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datos);
  XLSX.utils.book_append_sheet(libro, hoja, 'Turnos');

  XLSX.writeFile(libro, `${nombreArchivo}.csv`, { bookType: 'csv' });
};

export const exportarEstadisticasOSExcel = (
  estadisticas: any[],
  nombreArchivo: string
) => {
  const datos = estadisticas.map((stat) => ({
    'Obra Social': stat.nombre,
    'Total Turnos': stat.totalTurnos,
    'Completados': stat.completados,
    'Cancelados': stat.cancelados,
    'Ausentes': stat.ausentes,
    'Tasa Completados': `${stat.tasaCompletados.toFixed(1)}%`,
    'Tasa Ausentismo': `${stat.tasaAusentismo.toFixed(1)}%`,
  }));

  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(datos);

  const anchosColumnas = [
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
  ];
  hoja['!cols'] = anchosColumnas;

  XLSX.utils.book_append_sheet(libro, hoja, 'Obras Sociales');
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
};

// ============================================
// EXPORTAR A PDF
// ============================================

export const exportarResumenProfesionalPDF = (
  profesional: any,
  turnos: any[],
  estadisticas: any,
  periodo: string
) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text('Resumen Mensual - Profesional', 14, 20);

  doc.setFontSize(12);
  doc.text(
    `${profesional.apellido}, ${profesional.nombre}`,
    14,
    30
  );
  doc.text(`Matrícula: ${profesional.matricula}`, 14, 37);
  doc.text(`Especialidad: ${profesional.especialidad}`, 14, 44);
  doc.text(`Período: ${periodo}`, 14, 51);

  // Estadísticas
  doc.setFontSize(14);
  doc.text('Estadísticas', 14, 65);

  const statsData = [
    ['Total de Turnos', estadisticas.total.toString()],
    ['Completados', `${estadisticas.completados} (${estadisticas.tasaCompletados.toFixed(1)}%)`],
    ['Cancelados', estadisticas.cancelados.toString()],
    ['Ausentes', `${estadisticas.ausentes} (${estadisticas.tasaAusentismo.toFixed(1)}%)`],
    ['Promedio por Día', estadisticas.promedioPorDia.toFixed(1)],
  ];

  autoTable(doc, {
    startY: 70,
    head: [['Métrica', 'Valor']],
    body: statsData,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
  });

  // Tabla de Turnos
  doc.setFontSize(14);
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  doc.text('Detalle de Turnos', 14, finalY + 10);

  const turnosData = turnos.map((turno) => [
    format(new Date(turno.fechaHora), 'dd/MM/yyyy HH:mm', { locale: es }),
    `${turno.paciente.apellido}, ${turno.paciente.nombre}`,
    turno.estado,
    turno.tipo,
  ]);

  autoTable(doc, {
    startY: finalY + 15,
    head: [['Fecha/Hora', 'Paciente', 'Estado', 'Tipo']],
    body: turnosData,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233] },
    styles: { fontSize: 8 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Descargar
  doc.save(
    `resumen_${profesional.apellido}_${format(new Date(), 'yyyyMMdd')}.pdf`
  );
};
