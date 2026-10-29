/**
 * KioskQRModal — Modal táctil que muestra un QR para que el turista
 * lleve la ruta al smartphone. Genera el código QR sin dependencias externas
 * para garantizar compatibilidad con React 19 y despliegues en Render.
 */
import { useState } from 'react';
import { X, Smartphone, Navigation, Copy, Check, ExternalLink, MapPin } from 'lucide-react';

export default function KioskQRModal({ marker, onClose }) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!marker) return null;

  const lat = marker?.coordenadas?.lat;
  const lng = marker?.coordenadas?.lng;

  const googleMapsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
    : `https://www.google.com/maps/search/${encodeURIComponent(marker.nombre || 'Destino Turístico Jalisco')}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(googleMapsUrl)}&margin=10`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(googleMapsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback si clipboard falla
      setCopied(false);
    }
  };

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
              <p className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-sm mt-1">
                <MapPin size={14} className="text-slate-400" />
                <span>{marker.municipio}</span>
              </p>
            )}
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100 flex flex-col items-center justify-center min-h-[220px] min-w-[220px]">
            {!imgError ? (
              <img
                src={qrImageUrl}
                alt={`Código QR para navegar hacia ${marker.nombre || 'destino'}`}
                width={200}
                height={200}
                className="w-[200px] h-[200px] object-contain rounded-xl"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 gap-2">
                <Navigation className="w-8 h-8 text-cyan-500 animate-bounce" />
                <p className="text-xs text-slate-500 font-medium">Usa el botón de abajo para abrir la ruta directa en Google Maps</p>
              </div>
            )}
          </div>

          {/* Instrucción */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-3.5 w-full">
            <Navigation className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium leading-snug">
              Apunta con la cámara de tu smartphone para abrir la ruta a pie en Google Maps
            </p>
          </div>

          {/* Acciones de continuidad */}
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 py-3 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-3 rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-cyan-600" />
              <span>Abrir mapa</span>
            </a>
          </div>

          <button
            type="button"
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
