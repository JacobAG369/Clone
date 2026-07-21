import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Building2, Utensils, Calendar, Sparkles, AlertCircle, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// URLs confirmadas del repositorio público angelnmara/geojson (INEGI oficial)
// Fuente primaria: 14_Jalisco.json (~1.4 MB, ligero)
// Fuentes alternativas de respaldo con los polígonos de los 125 municipios
const GEOJSON_URLS = [
  'https://raw.githubusercontent.com/angelnmara/geojson/master/Municipios/14_Jalisco.json',
  'https://raw.githubusercontent.com/angelnmara/geojson/master/Municipios/MX-JAL.json',
  'https://raw.githubusercontent.com/PhantomInsights/mexico-geojson/main/2023/states/Jalisco.json',
  'https://raw.githubusercontent.com/PhantomInsights/mexico-geojson/main/2022/states/Jalisco.json',
  'https://raw.githubusercontent.com/PhantomInsights/mexico-geojson/main/2020/states/Jalisco.json',
];

export function JaliscoChoroplethMap({ densityData = [], onSelectMunicipio, selectedMunicipio }) {
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredMuni, setHoveredMuni] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // 1. Cargar GeoJSON de los municipios de Jalisco
  const loadGeoJson = async () => {
    setLoading(true);
    setError(null);
    let loaded = false;

    // Intentar cargar desde las fuentes directas con modo CORS explícito
    for (const url of GEOJSON_URLS) {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.features && data.features.length > 0) {
            setGeoJson(data);
            loaded = true;
            break;
          }
        }
      } catch (err) {
        console.warn(`[JaliscoChoroplethMap] Fuente fallida: ${url}`, err.message);
      }
    }

    // Fallback: usar jsDelivr CDN (mirror confiable de npm + github sin bloqueo CORS)
    if (!loaded) {
      const jsDelivrUrls = [
        'https://cdn.jsdelivr.net/gh/angelnmara/geojson@master/Municipios/14_Jalisco.json',
        'https://cdn.jsdelivr.net/gh/angelnmara/geojson@master/Municipios/MX-JAL.json',
      ];
      for (const url of jsDelivrUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data && data.features && data.features.length > 0) {
              setGeoJson(data);
              loaded = true;
              break;
            }
          }
        } catch (err) {
          console.warn(`[JaliscoChoroplethMap] jsDelivr fallback fallido: ${url}`, err.message);
        }
      }
    }

    if (!loaded) {
      setError('No se pudo cargar la cartografía vectorial del estado. Por favor verifica la conexión.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGeoJson();
  }, []);


  // 2. Crear mapa de búsqueda rápida de datos de densidad por municipio
  const dataMap = useMemo(() => {
    const map = new Map();
    const clean = (str) =>
      (str || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    densityData.forEach((item) => {
      if (item.municipio) {
        map.set(clean(item.municipio), item);
      }
    });
    return { map, clean };
  }, [densityData]);

  // Obtener el valor máximo para calcular la escala de calor
  const maxRecursos = useMemo(() => {
    if (!densityData.length) return 1;
    return Math.max(...densityData.map((d) => d.total_recursos || 0), 1);
  }, [densityData]);

  // 3. Proyectar coordenadas esféricas GeoJSON (lng, lat) al viewport SVG (800x600)
  const projection = useMemo(() => {
    if (!geoJson || !geoJson.features.length) return null;

    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;

    const processCoords = (coords) => {
      if (typeof coords[0] === 'number') {
        const [lng, lat] = coords;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      } else if (Array.isArray(coords)) {
        coords.forEach(processCoords);
      }
    };

    geoJson.features.forEach((feature) => {
      if (feature.geometry && feature.geometry.coordinates) {
        processCoords(feature.geometry.coordinates);
      }
    });

    const width = 800;
    const height = 560;
    const padding = 25;
    const availableW = width - padding * 2;
    const availableH = height - padding * 2;

    const lngSpan = maxLng - minLng || 1;
    const latSpan = maxLat - minLat || 1;
    // Corrección de escala de latitud para proyección Mercator a 20°N
    const latScaleCorrection = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
    const scale = Math.min(availableW / lngSpan, availableH / (latSpan / latScaleCorrection));

    const centerX = (width - lngSpan * scale) / 2;
    const centerY = (height - (latSpan / latScaleCorrection) * scale) / 2;

    const project = ([lng, lat]) => {
      const x = padding + (lng - minLng) * scale + centerX;
      const y = height - (padding + ((lat - minLat) / latScaleCorrection) * scale + centerY);
      return [x, y];
    };

    return { project };
  }, [geoJson]);

  // 4. Convertir geometría a atributo SVG 'd'
  const featureToSvgPath = (geometry) => {
    if (!projection || !geometry) return '';
    const { project } = projection;
    const type = geometry.type;
    const coords = geometry.coordinates;

    const ringToPath = (ring) => {
      return (
        ring
          .map((pt, i) => {
            const [x, y] = project(pt);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(' ') + ' Z'
      );
    };

    if (type === 'Polygon') {
      return coords.map(ringToPath).join(' ');
    } else if (type === 'MultiPolygon') {
      return coords.map((poly) => poly.map(ringToPath).join(' ')).join(' ');
    }
    return '';
  };

  // Obtener nombre limpio desde las propiedades del polígono
  const getMuniName = (feature) => {
    if (!feature || !feature.properties) return 'Desconocido';
    const p = feature.properties;
    return p.NOMGEO || p.NOM_MUN || p.nombre || p.name || p.NAME_2 || p.MUNICIPIO || 'Municipio';
  };

  // Determinar color ejecutivo estilo Power BI (Choropleth)
  const getPolygonColor = (muniName) => {
    const cleanName = dataMap.clean(muniName);
    let item = dataMap.map.get(cleanName);

    // Búsqueda aproximada si no coincide exacto
    if (!item) {
      for (const [key, val] of dataMap.map.entries()) {
        if (key.includes(cleanName) || cleanName.includes(key)) {
          item = val;
          break;
        }
      }
    }

    const count = item?.total_recursos || 0;
    if (count === 0) return { fill: '#e2e8f0', stroke: '#cbd5e1', opacity: 0.9, item: null }; // Sin datos — gris claro

    const ratio = count / maxRecursos;
    if (ratio > 0.75) {
      return { fill: '#ef4444', stroke: '#fca5a5', opacity: 0.95, item }; // Rojo calor máximo
    } else if (ratio > 0.4) {
      return { fill: '#f97316', stroke: '#fdba74', opacity: 0.90, item }; // Naranja alto
    } else if (ratio > 0.15) {
      return { fill: '#3b82f6', stroke: '#93c5fd', opacity: 0.85, item }; // Azul medio
    } else {
      return { fill: '#93c5fd', stroke: '#bfdbfe', opacity: 0.80, item }; // Azul claro bajo
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg p-6">
      {/* Header y Leyenda Superior estilo Power BI claro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Panel Ejecutivo de Inteligencia Geográfica
          </div>
          <h3 className="text-xl font-extrabold text-slate-800">
            Mapa Coroplético de Concentración — Estado de Jalisco
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Haz clic en cualquier municipio para filtrar instantáneamente el inventario y analizar su oferta turística.
          </p>
        </div>

        {/* Leyenda de Escala Térmica */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Escala de Densidad:</span>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span> 0
            <span className="w-3 h-3 rounded-full bg-blue-300"></span> Bajo
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Medio
            <span className="w-3 h-3 rounded-full bg-orange-400"></span> Alto
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Máximo
          </div>
        </div>
      </div>

      {/* Contenedor del Mapa vectorial */}
      <div
        className="relative w-full h-[540px] mt-4 flex items-center justify-center overflow-hidden bg-slate-50 rounded-xl border border-slate-100"
        onMouseMove={handleMouseMove}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-center p-8">
            <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">Generando geometría poligonal del estado...</p>
            <p className="text-xs text-slate-400 max-w-xs">Cargando 125 municipios e interpolando densidades del catálogo.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-sm font-semibold text-slate-700">{error}</p>
            <button
              onClick={loadGeoJson}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reintentar carga vectorial
            </button>
          </div>
        ) : projection ? (
          <>
            {/* Botones de zoom/reset */}
            <div className="absolute right-4 top-4 flex flex-col gap-1.5 z-10">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.3, 2.5))}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200 transition-all shadow-sm"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.3, 0.7))}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200 transition-all shadow-sm"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200 transition-all shadow-sm"
                title="Restablecer vista"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <svg
              viewBox="0 0 800 560"
              className="w-full h-full max-h-[540px] select-none transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              }}
            >
              <g>
                {geoJson.features.map((feature, idx) => {
                  const muniName = getMuniName(feature);
                  const { fill, stroke, opacity, item } = getPolygonColor(muniName);
                  const isSelected =
                    selectedMunicipio &&
                    dataMap.clean(selectedMunicipio) === dataMap.clean(muniName);
                  const isHovered = hoveredMuni?.name === muniName;

                  return (
                    <path
                      key={`${muniName}-${idx}`}
                      d={featureToSvgPath(feature.geometry)}
                      fill={fill}
                      stroke={isSelected ? '#2563eb' : isHovered ? '#1e293b' : stroke}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 0.6}
                      fillOpacity={isSelected || isHovered ? 1 : opacity}
                      filter={isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.20))' : 'none'}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() =>
                        setHoveredMuni({
                          name: muniName,
                          item,
                        })
                      }
                      onMouseLeave={() => setHoveredMuni(null)}
                      onClick={() => {
                        if (onSelectMunicipio) {
                          onSelectMunicipio(isSelected ? '' : muniName);
                        }
                      }}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Tooltip Ejecutivo Flotante estilo Power BI claro */}
            {hoveredMuni && (
              <div
                className="pointer-events-none absolute z-50 w-72 rounded-2xl bg-white p-4 border border-slate-200 shadow-2xl transition-all duration-75"
                style={{
                  left: Math.min(mousePos.x + 16, 480),
                  top: Math.min(mousePos.y + 16, 360),
                }}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Municipio
                  </span>
                  {hoveredMuni.item && (
                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-black border border-red-200">
                      Top #{densityData.findIndex((d) => d.municipio === hoveredMuni.item?.municipio) + 1}
                    </span>
                  )}
                </div>

                <div className="text-lg font-black text-slate-800 truncate">
                  {hoveredMuni.name}
                </div>

                {hoveredMuni.item ? (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded-xl">
                      <span className="text-slate-600 font-medium">Oferta Turística Total:</span>
                      <span className="text-sm font-black text-blue-700">
                        {hoveredMuni.item.total_recursos} puntos
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <div className="bg-slate-50 p-1.5 rounded-lg text-center border border-slate-200">
                        <div className="text-[10px] text-slate-400">Atractivos</div>
                        <div className="font-bold text-blue-600 flex items-center justify-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {hoveredMuni.item.desglose?.lugares || 0}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg text-center border border-slate-200">
                        <div className="text-[10px] text-slate-400">Gastronomía</div>
                        <div className="font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                          <Utensils className="w-3 h-3" /> {hoveredMuni.item.desglose?.restaurantes || 0}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg text-center border border-slate-200">
                        <div className="text-[10px] text-slate-400">Eventos</div>
                        <div className="font-bold text-purple-600 flex items-center justify-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {hoveredMuni.item.desglose?.eventos || 0}
                        </div>
                      </div>
                    </div>

                    {hoveredMuni.item.rating_promedio > 0 && (
                      <div className="flex justify-between items-center text-slate-500 pt-1">
                        <span>Calificación Promedio:</span>
                        <span className="font-bold text-amber-600">
                          ★ {hoveredMuni.item.rating_promedio.toFixed(1)} / 5.0
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400 italic">
                    Sin registros turísticos activos para este municipio actualmente.
                  </p>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
