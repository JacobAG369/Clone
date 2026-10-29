/**
 * JuniorHomePage — Menú principal exclusivo para el público de 10 a 16 años
 * ("Tu-Turismo Nuevas Generaciones") sobre fondo claro, optimizado para Kiosco
 * Interactivo Digital.
 *
 * - Requiere sesión iniciada para sumar spots y guarda el progreso en el usuario (MongoDB).
 * - Incluye botón QR de Kiosco en cada tarjeta para llevar la ruta al teléfono.
 * - Cero emojis: sólo iconografía vectorial Lucide y arte SVG.
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
  Target,
  Smartphone,
  LogIn,
  UserPlus,
  X,
} from 'lucide-react';
import {
  getLugaresDestacados,
  getEventosProximos,
  getRestaurantesRecomendados,
} from '../../api/home';
import { useGeneracionesStore, JUNIOR_CATEGORIES } from '../../store/useGeneracionesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useMapStore } from '../../store/useMapStore';
import KioskQRModal from '../map/components/KioskQRModal';
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
    tag: 'MUNDO 01 · NATURALEZA',
    title: 'Ruta Aventura',
    subtitle: 'Parques, zoológicos, acuarios y aire libre en Jalisco.',
    cover:
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-teal-500 to-cyan-600',
    cardBg: 'bg-teal-50/70 border-teal-200 hover:border-teal-400',
    badgeBg: 'bg-teal-500 text-white',
    btnClass: 'from-teal-500 to-cyan-600',
  },
  antojos: {
    icon: UtensilsCrossed,
    tag: 'MUNDO 02 · SABOR TAPATÍO',
    title: 'Ruta del Antojo',
    subtitle: 'Nieves de garrafa, postres, lonches y comida típica.',
    cover:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-amber-500 to-orange-600',
    cardBg: 'bg-amber-50/70 border-amber-200 hover:border-amber-400',
    badgeBg: 'bg-amber-500 text-white',
    btnClass: 'from-amber-500 to-orange-600',
  },
  curiosidades: {
    icon: FlaskConical,
    tag: 'MUNDO 03 · MENTES CURIOSAS',
    title: 'Ciencia y Leyendas',
    subtitle: 'Museos interactivos, planetarios e historia viva.',
    cover:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-indigo-600 to-violet-600',
    cardBg: 'bg-indigo-50/70 border-indigo-200 hover:border-indigo-400',
    badgeBg: 'bg-indigo-600 text-white',
    btnClass: 'from-indigo-600 to-violet-600',
  },
  aesthetic: {
    icon: Camera,
    tag: 'MUNDO 04 · CÁMARA EN MANO',
    title: 'Spots de Foto',
    subtitle: 'Miradores épicos, murales urbanos y plazas icónicas.',
    cover: catedralImg,
    gradient: 'from-rose-500 to-amber-500',
    cardBg: 'bg-rose-50/70 border-rose-200 hover:border-rose-400',
    badgeBg: 'bg-rose-500 text-white',
    btnClass: 'from-rose-500 to-amber-500',
  },
};

const EXPLORER_BADGES = [
  {
    id: 'explorador_bronce',
    title: 'Explorador Bronce',
    goal: 3,
    desc: 'Suma 3 spots visitados en tu cuenta',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'explorador_plata',
    title: 'Explorador Plata',
    goal: 10,
    desc: 'Descubre 10 destinos en Jalisco',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'explorador_oro',
    title: 'Explorador Oro Tapatío',
    goal: 25,
    desc: '25 spots coleccionados como maestro',
    color: 'from-amber-400 via-orange-500 to-rose-500',
  },
];

export default function JuniorHomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [qrItem, setQrItem] = useState(null);

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

  const allYouthItems = useMemo(() => {
    const mappedPlaces = (lugares || []).map((item) => ({
      id: String(item._id || item.id || item.nombre),
      nombre: item.nombre || 'Destino en Jalisco',
      descripcion: item.descripcion || 'Descubre este punto destacado en Jalisco.',
      categoria: item.categoria || 'Lugar Turístico',
      municipio: item.municipio || item.direccion || 'Jalisco',
      imagen: item.imagen_url || item.imagen || catedralImg,
      rating: Number(item.rating ?? item.rating_promedio ?? item.calificacion ?? 0),
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
      rating: Number(item.rating ?? item.calificacion ?? item.rating_promedio ?? 0),
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
      rating: Number(item.rating ?? item.calificacion ?? item.rating_promedio ?? 0),
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

  const handleCollectSpotClick = async (spotId) => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true);
      return;
    }
    const res = await collectSpot(spotId);
    if (!res?.ok && res?.reason === 'unauthenticated') {
      setShowAuthModal(true);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-cyan-50/40 text-slate-900 pb-24">
      {/* 1. BARRA DE IDENTIDAD KIOSCO JOVEN (FONDO CLARO) */}
      <div className="bg-white/90 border-b border-amber-200/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-sm">
              <Sparkles size={13} className="stroke-[2.5]" />
              <span>Nuevas Generaciones · 10 a 16 años</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <span>Kiosco Interactivo Jalisco</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                <Award size={15} className="text-amber-600" />
                <span className="text-xs font-extrabold text-slate-800">{currentRank}</span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-cyan-500 text-white">
                  {collectedSpots.length}/{nextGoal} spots
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate({ to: '/login' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-extrabold border border-cyan-200 transition-colors cursor-pointer"
              >
                <LogIn size={13} />
                <span>Inicia sesión para guardar spots</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExitToStandard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold border border-slate-200 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeftRight size={13} className="text-amber-600" />
              <span>Menú Estándar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO PRINCIPAL LUMINOSO CON COLORES TU-TURISMO + JALISCO */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:py-14 border-b border-amber-100">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Columna Izquierda */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-300 text-teal-800 text-xs font-black tracking-wide uppercase">
                <Compass size={14} className="text-teal-600" />
                <span>Tu aventura joven en Jalisco</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900">
                Descubre la tierra de la{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600">
                  aventura, la ciencia
                </span>{' '}
                y el{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                  orgullo tapatío
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-medium">
                Toca cualquier mundo para explorar parques, museos interactivos, miradores y antojos legendarios. Suma spots en tu cuenta o escanea el código QR para llevar la ruta en tu celular.
              </p>

              {/* Buscador táctil claro */}
              <div className="relative max-w-xl">
                <div className="flex items-center bg-white border-2 border-slate-200 focus-within:border-cyan-500 rounded-2xl p-1.5 shadow-md transition-colors">
                  <div className="pl-3 pr-2 text-cyan-600">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Busca parques, museos, nieves, miradores..."
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-2 font-medium"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-slate-700"
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
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold text-xs shrink-0 transition-all cursor-pointer"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* Botones táctiles de Kiosco */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate({ to: '/map' })}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Map size={18} className="stroke-[2.5]" />
                  <span>Abrir Radar en el Mapa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('mundos-nuevas-generaciones');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-extrabold text-sm bg-white hover:bg-slate-50 text-slate-800 border-2 border-cyan-400 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Zap size={17} className="text-amber-500" />
                  <span>Ver los 4 Mundos</span>
                </button>
              </div>
            </div>

            {/* Columna Derecha: Portada Visual y Pasaporte */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300 shadow-xl bg-white group">
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src={catedralImg}
                    alt="Guadalajara y Jalisco Nuevas Generaciones"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 via-transparent to-amber-500/30" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/95 text-slate-900 shadow">
                      Pasaporte Joven
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow">
                      {currentRank}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-700">
                          {isAuthenticated
                            ? `Tus Spots guardados: ${collectedSpots.length}`
                            : 'Inicia sesión para guardar tus Spots'}
                        </span>
                        <span className="font-black text-teal-600">
                          Meta: {nextGoal} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500 transition-all duration-500"
                          style={{ width: `${Math.max(8, progressPct)}%` }}
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

      {/* 3. LOS 4 MUNDOS INTERACTIVOS (BENTO CLARO CON PORTADA) */}
      <section id="mundos-nuevas-generaciones" className="py-10 sm:py-14 container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-600 mb-1">
              <Target size={14} />
              <span>Explora por tema</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Los 4 Mundos de Jalisco
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Toca un mundo para filtrar las tarjetas o abrir directamente el mapa.
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
                className={`group rounded-3xl overflow-hidden bg-white border-2 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl ${
                  isSelected
                    ? 'border-amber-500 ring-4 ring-amber-400/20'
                    : 'border-slate-200/90 hover:border-cyan-400'
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={theme.cover}
                    alt={theme.title}
                    onError={(e) => {
                      e.currentTarget.src = catedralImg;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow ${theme.badgeBg}`}>
                      {theme.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3.5 flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.btnClass} flex items-center justify-center text-white shadow-md`}>
                      <Icon size={18} className="stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-black text-white leading-tight drop-shadow">
                      {theme.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {theme.subtitle}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectWorldCatalog(cat.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isSelected ? 'Activo abajo' : 'Ver lugares'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWorldExploreMap(cat.id)}
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-xs bg-gradient-to-r ${theme.btnClass} text-white hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm`}
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

      {/* 4. INSIGNIAS DESBLOQUEABLES (FONDO CLARO CÁLIDO) */}
      <section className="py-8 bg-gradient-to-r from-amber-50 via-cyan-50/60 to-rose-50 border-y border-amber-200/70">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXPLORER_BADGES.map((b) => {
              const unlocked = badges.includes(b.id) || collectedSpots.length >= b.goal;
              const spotCount = Math.min(collectedSpots.length, b.goal);

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 bg-white shadow-sm ${
                    unlocked ? 'border-amber-400' : 'border-slate-200/80'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${
                      unlocked ? b.color : 'from-slate-200 to-slate-300'
                    } text-white shadow-sm`}
                  >
                    <Award size={22} className={unlocked ? 'text-white' : 'text-slate-500'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-slate-900 truncate">{b.title}</h3>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          unlocked
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {unlocked ? 'Desbloqueada' : `${spotCount}/${b.goal}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CATÁLOGO INTERACTIVO DE KIOSCO (CON GUARDADO EN USUARIO Y QR) */}
      <section id="catalogo-joven-jalisco" className="py-10 sm:py-14 container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-teal-600 mb-1">
              <Flame size={14} className="text-amber-500" />
              <span>Catálogo Kiosco en Tiempo Real</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Explora y Suma tus Spots en Jalisco
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {[
              { id: 'todos', label: 'Todos', icon: Sparkles },
              { id: 'aventura', label: 'Aventura', icon: Compass },
              { id: 'antojos', label: 'Antojos', icon: UtensilsCrossed },
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
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 text-white border-transparent shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-400'
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
                className="h-80 rounded-3xl bg-white border border-slate-200 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="h-40 rounded-2xl bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-9 w-full bg-slate-100 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl bg-white border-2 border-slate-200 p-10 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              No encontramos resultados con ese filtro
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedTab('todos');
                setSearchTerm('');
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs transition-colors cursor-pointer"
            >
              Ver todos los destinos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.slice(0, 12).map((item) => {
              const isCollected = isAuthenticated && collectedSpots.includes(item.id);

              return (
                <div
                  key={`${item.sourceType}-${item.id}`}
                  className="group rounded-3xl overflow-hidden bg-white border-2 border-slate-200/90 hover:border-cyan-400 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      onError={(e) => {
                        e.currentTarget.src = catedralImg;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm truncate">
                        {item.categoria}
                      </span>

                      {item.rating > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 shadow-sm">
                          <Star size={11} className="fill-current" />
                          <span>{item.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>

                    {/* Botón QR Kiosco sobre la imagen */}
                    <button
                      type="button"
                      onClick={() => setQrItem(item)}
                      title="Escanear QR para llevar en tu celular"
                      className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 hover:bg-cyan-500 text-slate-800 hover:text-white text-[10px] font-black shadow-md transition-colors cursor-pointer"
                    >
                      <Smartphone size={11} />
                      <span>QR Móvil</span>
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-1">
                        {item.nombre}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
                        <MapPin size={13} className="shrink-0 text-amber-500" />
                        <span className="truncate">{item.municipio}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
                        {item.descripcion}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCollectSpotClick(item.id)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          isCollected
                            ? 'bg-teal-50 text-teal-700 border-2 border-teal-300'
                            : 'bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-white border-2 border-amber-300'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isCollected ? 'Spot Guardado' : 'Sumar Spot'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenInMap(item)}
                        className="py-2.5 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                      >
                        <span>Mapa</span>
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

      {/* MODAL: INICIO DE SESIÓN REQUERIDO PARA SUMAR SPOTS */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setShowAuthModal(false)}
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-slate-900 shadow-2xl border-2 border-amber-300 text-center space-y-4">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Award size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                ¡Guarda tus Spots en tu cuenta!
              </h3>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Para sumar este lugar a tu pasaporte y desbloquear insignias, inicia sesión con tu cuenta de Tu-Turismo.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate({ to: '/login' });
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn size={16} />
                <span>Iniciar Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate({ to: '/register' });
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Crear Cuenta Gratis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR DE KIOSCO PARA LLEVAR RUTA AL CELULAR */}
      {qrItem && <KioskQRModal marker={qrItem} onClose={() => setQrItem(null)} />}
    </div>
  );
}
