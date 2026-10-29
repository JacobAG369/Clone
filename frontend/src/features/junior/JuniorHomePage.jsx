/**
 * JuniorHomePage — Menú principal exclusivo para el público de 10 a 16 años
 * ("Tu-Turismo Nuevas Generaciones").
 *
 * Diseño único que fusiona la identidad de Tu-Turismo (Cyan, Azul, Indigo, Slate)
 * con colores temáticos de Jalisco (Verde Agave/Teal, Oro Mariachi/Ámbar,
 * Terracota de Tonalá/Naranja y Rosa Tapatío).
 * CERO EMOJIS: Uso exclusivo de iconografía vectorial Lucide y gráficos SVG propios.
 */
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Compass,
  UtensilsCrossed,
  FlaskConical,
  Camera,
  Sparkles,
  MapPin,
  Star,
  Award,
  Flame,
  Map,
  CheckCircle2,
  ArrowRight,
  ArrowLeftRight,
  Search,
  Calendar,
  Zap,
  Shield,
  Target,
} from 'lucide-react';
import {
  getLugaresDestacados,
  getEventosProximos,
  getRestaurantesRecomendados,
} from '../../api/home';
import { useGeneracionesStore, JUNIOR_CATEGORIES } from '../../store/useGeneracionesStore';
import { useMapStore } from '../../store/useMapStore';
import catedralImg from '../../assets/catedral.jpg';

function matchesJuniorCategory(item, categoryId) {
  if (!item || !categoryId) return true;
  const catConfig = JUNIOR_CATEGORIES.find((c) => c.id === categoryId);
  if (!catConfig || !Array.isArray(catConfig.keywords)) return true;
  const textToSearch = `${item.nombre || ''} ${item.categoria || ''} ${item.tipo_comida || ''} ${item.tipo || ''} ${item.descripcion || ''} ${item.municipio || ''} ${item.direccion || ''}`.toLowerCase();
  const hasTag =
    Array.isArray(item.tags) &&
    item.tags.some((t) =>
      catConfig.keywords.some((k) => String(t).toLowerCase().includes(k))
    );
  const hasKeyword = catConfig.keywords.some((k) => textToSearch.includes(k));
  return hasTag || hasKeyword;
}

const WORLD_THEMES = {
  aventura: {
    icon: Compass,
    tag: 'MUNDO 01 · NATURALEZA Y ACCIÓN',
    title: 'Ruta Aventura',
    subtitle: 'Parques, zoológicos, acuarios, senderos y aire libre en Jalisco.',
    cover:
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-teal-500 via-cyan-600 to-blue-700',
    borderGlow: 'hover:border-teal-400/80',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    accentText: 'text-teal-400',
    btnClass: 'from-teal-500 to-cyan-600',
  },
  antojos: {
    icon: UtensilsCrossed,
    tag: 'MUNDO 02 · SABOR TAPATÍO',
    title: 'Ruta del Antojo',
    subtitle: 'Nieves de garrafa, postres tradicionales, lonches y comida típica.',
    cover:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    borderGlow: 'hover:border-amber-400/80',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    accentText: 'text-amber-400',
    btnClass: 'from-amber-500 to-orange-600',
  },
  curiosidades: {
    icon: FlaskConical,
    tag: 'MUNDO 03 · MENTES CURIOSAS',
    title: 'Ciencia y Leyendas',
    subtitle: 'Museos interactivos, planetarios, historia viva y cultura creativa.',
    cover:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-indigo-600 via-violet-600 to-cyan-600',
    borderGlow: 'hover:border-indigo-400/80',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    accentText: 'text-indigo-400',
    btnClass: 'from-indigo-600 to-violet-600',
  },
  aesthetic: {
    icon: Camera,
    tag: 'MUNDO 04 · CÁMARA EN MANO',
    title: 'Spots de Foto',
    subtitle: 'Miradores épicos, murales urbanos, plazas y arquitectura icónica.',
    cover: catedralImg,
    gradient: 'from-rose-500 via-fuchsia-600 to-amber-500',
    borderGlow: 'hover:border-rose-400/80',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    accentText: 'text-rose-400',
    btnClass: 'from-rose-500 to-amber-500',
  },
};

const EXPLORER_BADGES = [
  {
    id: 'explorador_bronce',
    title: 'Explorador Bronce',
    goal: 3,
    desc: 'Registra tu visita en 3 puntos de Jalisco',
    color: 'from-amber-600 to-orange-500',
  },
  {
    id: 'explorador_plata',
    title: 'Explorador Plata',
    goal: 10,
    desc: 'Descubre 10 destinos, museos o parques',
    color: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'explorador_oro',
    title: 'Explorador Oro Tapatío',
    goal: 25,
    desc: 'Completa 25 lugares como maestro explorador',
    color: 'from-amber-400 via-yellow-500 to-rose-500',
  },
];

export default function JuniorHomePage() {
  const navigate = useNavigate();
  const {
    activeJuniorCategory,
    setActiveJuniorCategory,
    setJuniorMode,
    badges,
    collectedSpots,
    collectSpot,
  } = useGeneracionesStore();
  const setMapCenter = useMapStore((s) => s.setMapCenter);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);

  const [selectedTab, setSelectedTab] = useState(activeJuniorCategory || 'todos');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: lugares = [], isLoading: loadingLugares } = useQuery({
    queryKey: ['lugares', 'destacados'],
    queryFn: getLugaresDestacados,
  });

  const { data: eventos = [], isLoading: loadingEventos } = useQuery({
    queryKey: ['eventos', 'proximos'],
    queryFn: getEventosProximos,
  });

  const { data: restaurantes = [], isLoading: loadingRestaurantes } = useQuery({
    queryKey: ['restaurantes', 'recomendados'],
    queryFn: getRestaurantesRecomendados,
  });

  const isLoading = loadingLugares || loadingEventos || loadingRestaurantes;

  // Unificar recursos en un catálogo juvenil enriquecido
  const allYouthItems = useMemo(() => {
    const mappedPlaces = (lugares || []).map((item) => ({
      id: String(item._id || item.id || item.nombre),
      nombre: item.nombre || 'Destino en Jalisco',
      descripcion: item.descripcion || 'Descubre este punto destacado en Jalisco.',
      categoria: item.categoria || 'Lugar Turístico',
      municipio: item.municipio || item.direccion || 'Jalisco',
      imagen: item.imagen_url || item.imagen || catedralImg,
      rating: Number(item.rating_promedio || item.calificacion || 0),
      coordenadas: item.coordenadas || null,
      sourceType: 'lugares',
      raw: item,
    }));

    const mappedRestaurants = (restaurantes || []).map((item) => ({
      id: String(item._id || item.id || item.nombre),
      nombre: item.nombre || 'Sabor Tapatío',
      descripcion: item.descripcion || 'Gastronomía y antojos tradicionales.',
      categoria: item.tipo_comida || item.categoria || 'Gastronomía',
      municipio: item.municipio || item.direccion || 'Jalisco',
      imagen: item.imagen_url || item.imagen || WORLD_THEMES.antojos.cover,
      rating: Number(item.calificacion || item.rating_promedio || 0),
      coordenadas: item.coordenadas || null,
      sourceType: 'restaurantes',
      raw: item,
    }));

    const mappedEvents = (eventos || []).map((item) => ({
      id: String(item._id || item.id || item.nombre),
      nombre: item.nombre || 'Evento Cultural',
      descripcion: item.descripcion || 'Actividad cultural y recreativa en Jalisco.',
      categoria: item.categoria || 'Evento',
      municipio: item.municipio || item.lugar || 'Jalisco',
      imagen: item.imagen_url || item.imagen || WORLD_THEMES.curiosidades.cover,
      rating: Number(item.calificacion || 0),
      coordenadas: item.coordenadas || null,
      sourceType: 'eventos',
      raw: item,
    }));

    return [...mappedPlaces, ...mappedRestaurants, ...mappedEvents];
  }, [lugares, restaurantes, eventos]);

  const filteredItems = useMemo(() => {
    return allYouthItems.filter((item) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchText =
          item.nombre.toLowerCase().includes(q) ||
          item.descripcion.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q) ||
          item.municipio.toLowerCase().includes(q);
        if (!matchText) return false;
      }

      if (selectedTab === 'todos') return true;
      if (selectedTab === 'eventos') return item.sourceType === 'eventos';
      if (selectedTab === 'antojos' && item.sourceType === 'restaurantes') return true;

      return matchesJuniorCategory(item.raw, selectedTab);
    });
  }, [allYouthItems, selectedTab, searchTerm]);

  const currentRank = useMemo(() => {
    const count = collectedSpots.length;
    if (count >= 25) return 'Explorador Oro Tapatío';
    if (count >= 10) return 'Explorador Plata';
    if (count >= 3) return 'Explorador Bronce';
    return 'Explorador Inicial';
  }, [collectedSpots.length]);

  const nextGoal = useMemo(() => {
    const count = collectedSpots.length;
    if (count < 3) return 3;
    if (count < 10) return 10;
    return 25;
  }, [collectedSpots.length]);

  const progressPct = Math.min(100, Math.round((collectedSpots.length / nextGoal) * 100));

  const handleOpenInMap = (item) => {
    if (item?.coordenadas?.lat && item?.coordenadas?.lng) {
      setMapCenter({ lat: item.coordenadas.lat, lng: item.coordenadas.lng });
    }
    if (item?.sourceType) {
      setActiveCategory(item.sourceType);
    }
    navigate({ to: '/map' });
  };

  const handleWorldExploreMap = (worldId) => {
    setActiveJuniorCategory(worldId);
    navigate({ to: '/map' });
  };

  const handleSelectWorldCatalog = (worldId) => {
    setSelectedTab(worldId);
    const catalogEl = document.getElementById('catalogo-joven-jalisco');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExitToStandard = () => {
    setJuniorMode(false);
    setActiveJuniorCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* 1. BARRA SUPERIOR DE IDENTIDAD Y PASAPORTE JOVEN */}
      <div className="bg-slate-900/90 border-b border-cyan-500/20 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-sm">
              <Sparkles size={12} className="stroke-[2.5]" />
              <span>Nuevas Generaciones · 10 a 16 años</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <Shield size={14} className="text-teal-400" />
              <span>Menú Principal Exclusivo Jalisco</span>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800">
              <Award size={15} className="text-amber-400" />
              <span className="text-xs font-extrabold text-slate-200">{currentRank}</span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {collectedSpots.length}/{nextGoal} spots
              </span>
            </div>

            <button
              type="button"
              onClick={handleExitToStandard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeftRight size={13} className="text-amber-400" />
              <span>Volver al menú estándar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO PRINCIPAL ASIMÉTRICO CON IDENTIDAD TU-TURISMO + JALISCO */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:py-16 border-b border-slate-800/80">
        {/* Fondos atmosféricos: Cyan/Indigo (Tu-Turismo) + Ámbar/Agave/Terracota (Jalisco) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* Patrón geométrico SVG de Agave y Sol Tapatío */}
        <svg
          viewBox="0 0 600 600"
          aria-hidden="true"
          className="absolute -right-28 -top-28 w-[480px] h-[480px] text-amber-500/10 pointer-events-none"
          fill="none"
        >
          <circle cx="300" cy="300" r="240" stroke="currentColor" strokeWidth="2" strokeDasharray="12 12" />
          <circle cx="300" cy="300" r="180" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M300 30L335 195L485 115L385 245L570 300L385 355L485 485L335 405L300 570L265 405L115 485L215 355L30 300L215 245L115 115L265 195Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Columna Izquierda: Mensaje Juvenil y Buscador Directo */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/35 text-teal-300 text-xs font-extrabold tracking-wide uppercase">
                <Compass size={14} className="text-amber-400" />
                <span>Espacio exclusivo para jóvenes exploradores</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Descubre la tierra de la{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400">
                  aventura, la ciencia
                </span>{' '}
                y el{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                  orgullo tapatío
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Bienvenido a tu menú principal personalizado. Explora parques extremos, museos interactivos, miradores urbanos y los mejores antojos de Guadalajara y Jalisco diseñados para edades de 10 a 16 años.
              </p>

              {/* Barra de búsqueda rápida juvenil */}
              <div className="relative max-w-xl">
                <div className="flex items-center bg-slate-900/95 border-2 border-slate-700/80 focus-within:border-cyan-400 rounded-2xl p-1.5 shadow-xl transition-colors">
                  <div className="pl-3 pr-2 text-cyan-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Busca parques, museos, nieves, miradores o municipios..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none py-2"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Limpiar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('catalogo-joven-jalisco');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shrink-0 transition-all cursor-pointer"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* Botones de Acción Rápida */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate({ to: '/map' })}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Map size={18} className="stroke-[2.5]" />
                  <span>Abrir Radar Joven en el Mapa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('mundos-nuevas-generaciones');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-all active:scale-95 cursor-pointer"
                >
                  <Zap size={17} className="text-amber-400" />
                  <span>Explorar los 4 Mundos</span>
                </button>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Portada Interactiva Jalisco Joven */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.25)] bg-slate-900 group">
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  <img
                    src={catedralImg}
                    alt="Guadalajara y Jalisco Nuevas Generaciones"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/60 via-transparent to-amber-500/30" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-300 border border-amber-400/40 backdrop-blur-md">
                      Ruta Tapatía Activa
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-500/90 text-slate-950">
                      Nivel: {currentRank}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 space-y-3">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
                        Pasaporte de Exploración
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        Tu progreso por Jalisco
                      </h2>
                    </div>

                    {/* Barra de progreso hacia la siguiente insignia */}
                    <div className="bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">
                          Lugares visitados: <strong className="text-amber-400">{collectedSpots.length}</strong>
                        </span>
                        <span className="font-extrabold text-cyan-300">
                          Meta siguiente: {nextGoal} spots ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 transition-all duration-500"
                          style={{ width: `${ Math.max(8, progressPct) }%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOS 4 MUNDOS INTERACTIVOS DE JALISCO (BENTO GRID CON PORTADA) */}
      <section id="mundos-nuevas-generaciones" className="py-12 sm:py-16 container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2">
              <Target size={14} />
              <span>Rutas diseñadas para 10 a 16 años</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Elige tu Mundo en Jalisco
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Selecciona una ruta para filtrar el catálogo en vivo aquí abajo o salta directamente al mapa interactivo con los marcadores de tu interés.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {JUNIOR_CATEGORIES.map((cat) => {
            const theme = WORLD_THEMES[cat.id] || WORLD_THEMES.aventura;
            const Icon = theme.icon;
            const isSelected = selectedTab === cat.id;

            return (
              <div
                key={cat.id}
                className={`group relative rounded-3xl overflow-hidden bg-slate-900 border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-xl shadow-amber-500/10'
                    : `border-slate-800 ${theme.borderGlow}`
                }`}
              >
                {/* Imagen de portada del mundo */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={theme.cover}
                    alt={theme.title}
                    onError={(e) => {
                      e.currentTarget.src = catedralImg;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-45 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${theme.badgeBg}`}>
                      {theme.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.btnClass} flex items-center justify-center text-white shadow-lg`}>
                      <Icon size={20} className="stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-black text-white leading-tight drop-shadow">
                      {theme.title}
                    </h3>
                  </div>
                </div>

                {/* Descripción y acciones */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {theme.subtitle}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectWorldCatalog(cat.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      {isSelected ? 'Viendo abajo' : 'Ver tarjetas'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWorldExploreMap(cat.id)}
                      title={`Ver ${theme.title} en el mapa`}
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-xs bg-gradient-to-r ${theme.btnClass} text-white hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer shrink-0`}
                    >
                      <Map size={13} />
                      <span>Mapa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. INSIGNIAS Y RETOS DE EXPLORADOR TAPATÍO */}
      <section className="py-10 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-y border-slate-800/80">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                Sistema de Recompensas
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Insignias de Explorador Nuevas Generaciones
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              Marca los lugares que ya conoces o que planeas visitar en las tarjetas de abajo para sumar puntos y desbloquear las 3 insignias de Jalisco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXPLORER_BADGES.map((b) => {
              const unlocked = badges.includes(b.id) || collectedSpots.length >= b.goal;
              const spotCount = Math.min(collectedSpots.length, b.goal);

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                    unlocked
                      ? 'bg-gradient-to-br from-slate-900 to-amber-950/40 border-amber-400/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/70 border-slate-800/90'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${
                      unlocked ? b.color : 'from-slate-800 to-slate-700'
                    } text-white shadow-md`}
                  >
                    <Award size={24} className={unlocked ? 'text-white' : 'text-slate-400'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white truncate">{b.title}</h3>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          unlocked
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {unlocked ? 'Desbloqueada' : `${spotCount}/${b.goal}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CATÁLOGO JUVENIL EN VIVO (LUGARES, ANTOJOS Y EVENTOS) */}
      <section id="catalogo-joven-jalisco" className="py-12 sm:py-16 container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-teal-400 mb-1">
              <Flame size={14} className="text-amber-400" />
              <span>Catálogo interactivo en tiempo real</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Explora y Colecciona Destinos en Jalisco
            </h2>
          </div>

          {/* Pestañas de filtrado juvenil */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {[
              { id: 'todos', label: 'Todos los Mundos', icon: Sparkles },
              { id: 'aventura', label: 'Aventura', icon: Compass },
              { id: 'antojos', label: 'Antojos Tapatíos', icon: UtensilsCrossed },
              { id: 'curiosidades', label: 'Ciencia y Cultura', icon: FlaskConical },
              { id: 'aesthetic', label: 'Spots de Foto', icon: Camera },
              { id: 'eventos', label: 'Eventos', icon: Calendar },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-amber-500 text-white border-transparent shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-white'
                  }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="h-40 rounded-2xl bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-slate-800 rounded" />
                  <div className="h-3 w-full bg-slate-800 rounded" />
                  <div className="h-9 w-full bg-slate-800 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-10 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-black text-white">
              No encontramos resultados con ese filtro
            </h3>
            <p className="text-xs text-slate-400">
              Prueba seleccionando &ldquo;Todos los Mundos&rdquo; o limpia el término de búsqueda para ver todos los destinos disponibles en Jalisco.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTab('todos');
                setSearchTerm('');
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              Mostrar todos los destinos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.slice(0, 12).map((item) => {
              const isCollected = collectedSpots.includes(item.id);

              return (
                <div
                  key={`${item.sourceType}-${item.id}`}
                  className="group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-cyan-500/10"
                >
                  {/* Imagen del recurso */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      onError={(e) => {
                        e.currentTarget.src = catedralImg;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-950/30" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-cyan-300 border border-cyan-400/30 backdrop-blur-md truncate">
                        {item.categoria}
                      </span>

                      {item.rating > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow">
                          <Star size={11} className="fill-current" />
                          <span>{item.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Información */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-white leading-snug line-clamp-1">
                        {item.nombre}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-300/90">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{item.municipio}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                        {item.descripcion}
                      </p>
                    </div>

                    {/* Botones de interacción juvenil: Coleccionar Spot + Abrir en Mapa */}
                    <div className="pt-3 border-t border-slate-800/90 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => collectSpot(item.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isCollected
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                            : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isCollected ? 'Visitado' : 'Sumar Spot'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenInMap(item)}
                        className="py-2 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center gap-1 transition-all cursor-pointer shrink-0"
                      >
                        <span>Ubicar</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

