'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Download, Smartphone, QrCode } from 'lucide-react';

export function QRInstalacion() {
  const appUrl = 'https://sanatorio-turnos.netlify.app';

  const descargarQR = () => {
    const svg = document.getElementById('qr-code-svg') as unknown as SVGElement;
    if (!svg) return;

    // Crear un canvas más grande para mejor calidad
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1000; // Tamaño grande para impresión
    canvas.width = size;
    canvas.height = size + 300; // Espacio extra para texto

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sistema de Turnos', size / 2, 60);

    // Subtítulo
    ctx.font = '32px Arial';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('Escaneá el código para instalar', size / 2, 110);

    // Convertir SVG a imagen
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Dibujar QR centrado con padding
      const qrSize = 800;
      const qrX = (size - qrSize) / 2;
      const qrY = 150;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Instrucciones
      ctx.font = '28px Arial';
      ctx.fillStyle = '#374151';
      ctx.fillText('1. Abrí la cámara de tu celular', size / 2, qrY + qrSize + 60);
      ctx.fillText('2. Apuntá al código QR', size / 2, qrY + qrSize + 100);
      ctx.fillText('3. Tocá en "Instalar aplicación"', size / 2, qrY + qrSize + 140);

      // URL pequeña al final
      ctx.font = '20px Arial';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(appUrl, size / 2, qrY + qrSize + 200);

      // Descargar
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'qr-instalacion-turnos.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <QrCode size={24} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            QR de Instalación
          </h2>
          <p className="text-sm text-gray-600">
            Para que los pacientes instalen la app en su celular
          </p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-6">
        {/* QR en pantalla */}
        <div className="bg-white p-6 rounded-lg border-4 border-gray-200 shadow-sm">
          <QRCodeSVG
            id="qr-code-svg"
            value={appUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* URL */}
        <div className="text-center">
          <p className="text-sm font-mono text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            {appUrl}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 w-full">
          <button
            onClick={descargarQR}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3
                     bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg
                     transition-colors"
          >
            <Download size={20} />
            Descargar QR (Alta Calidad)
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-6 py-3
                     bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg
                     transition-colors"
          >
            Imprimir
          </button>
        </div>

        {/* Instrucciones */}
        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Smartphone size={20} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                Instrucciones para el paciente:
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Abrí la cámara de tu celular (no necesitas app especial)</li>
                <li>Apuntá la cámara al código QR</li>
                <li>Tocá la notificación que aparece</li>
                <li>En el navegador, tocá "Instalar" o el ícono ⊕</li>
                <li>La app se instalará como cualquier otra aplicación</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="w-full text-center text-sm text-gray-500">
          <p>
            Compatible con Android, iOS y computadoras. La app es una PWA
            (Progressive Web App) que funciona sin necesidad de descargarla
            desde Play Store o App Store.
          </p>
        </div>
      </div>

      {/* CSS para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-code-svg,
          #qr-code-svg * {
            visibility: visible;
          }
          #qr-code-svg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(2);
          }
        }
      `}</style>
    </div>
  );
}
