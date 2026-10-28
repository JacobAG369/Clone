/**
 * KioskQRModal — Modal táctil que muestra un QR para que el turista
 * lleve la ruta al smartphone. Usa una URL de Google Maps por defecto.
 */
import { X, Smartphone, Navigation } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function KioskQRModal({ marker, onClose }) {
  if (!marker) return null;

  const lat = marker?.coordenadas?.lat;
  const lng = marker?.coordenadas?.lng;

  const googleMapsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
    : `https://www.google.com/maps/search/${encodeURIComponent(marker.nombre || 'Destino Turístico Jalisco')}`;

  return (
    <div
      className="absolute inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Llevar a mi teléfono</p>
              <p className="text-white/80 text-xs">Escanea el QR con tu cámara</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 flex flex-col items-center gap-5">
          <div>
            <h3 className="text-slate-900 dark:text-white font-extrabold text-xl text-center leading-tight">
              {marker.nombre || 'Destino Seleccionado'}
            </h3>
            {marker.municipio && (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1">
                📍 {marker.municipio}
              </p>
            )}
          </div>

          {/* QR Code */}
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
            <QRCodeSVG
              value={googleMapsUrl}
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Instrucción */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 w-full">
            <Navigation className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-snug">
              Abre la cámara de tu teléfono y apunta aquí para obtener la ruta a pie en Google Maps
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all active:scale-95"
          >
            Cerrar y seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}
