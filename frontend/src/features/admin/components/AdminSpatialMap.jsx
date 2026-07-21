import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, TrendingUp, Layers, Search, ArrowUpDown, ExternalLink, Award, Sparkles, Building2, Utensils, Calendar } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { adminApi } from '../../../api/admin';
import { useMapStore } from '../../../store/useMapStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { JaliscoChoroplethMap } from './JaliscoChoroplethMap';

export function AdminSpatialMap() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total_desc'); // 'total_desc', 'total_asc', 'name'
  const navigate = useNavigate();
  const setMapCenter = useMapStore((state) => state.setMapCenter);

  const { data: densityData = [], isLoading, isError } = useQuery({
    queryKey: ['admin-spatial-density'],
    queryFn: adminApi.getSpatialDensity,
  });

  const filteredData = useMemo(() => {
    let result = densityData.filter((item) =>
      item.municipio?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'total_desc') {
      result.sort((a, b) => (b.total_recursos || 0) - (a.total_recursos || 0));
    } else if (sortBy === 'total_asc') {
      result.sort((a, b) => (a.total_recursos || 0) - (b.total_recursos || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.municipio || '').localeCompare(b.municipio || ''));
    }
    return result;
  }, [densityData, searchTerm, sortBy]);

  const stats = useMemo(() => {
    if (!densityData.length) return { totalClusters: 0, topCluster: null, totalGeneral: 0 };
    let totalGeneral = 0;
    let topCluster = densityData[0];
    densityData.forEach((item) => {
      totalGeneral += item.total_recursos || 0;
      if ((item.total_recursos || 0) > (topCluster?.total_recursos || 0)) {
        topCluster = item;
      }
    });
    return {
      totalClusters: densityData.length,
      topCluster,
      totalGeneral,
    };
  }, [densityData]);

  const handleInspectMap = (item) => {
    if (item.coordenadas_centro && item.coordenadas_centro.lat && item.coordenadas_centro.lng) {
      setMapCenter({
        lat: item.coordenadas_centro.lat,
        lng: item.coordenadas_centro.lng,
      });
      navigate({ to: '/map' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-8 text-white shadow-xl border border-blue-400/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-extrabold text-white uppercase tracking-wider mb-3 border border-white/30 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Geo-Analítica Avanzada
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              Concentración Territorial y Densidad Turística
            </h2>
            <p className="mt-2 text-sm sm:text-base font-medium text-white/90 max-w-2xl leading-relaxed">
              Análisis geoespacial en tiempo real sobre la distribución de atractivos, eventos y restaurantes por municipio para la toma de decisiones estratégicas.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-indigo-500" /> Clústeres Detectados
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalClusters} <span className="text-sm font-normal text-slate-400">zonas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Regiones activas en el estado de Jalisco
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Award className="w-4 h-4 text-amber-500" /> Mayor Concentración
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
              {stats.topCluster ? stats.topCluster.municipio : 'N/A'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stats.topCluster ? `${stats.topCluster.total_recursos} recursos turísticos registrados` : 'Sin datos disponibles'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Layers className="w-4 h-4 text-emerald-500" /> Total Oferta Mapeada
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalGeneral} <span className="text-sm font-normal text-slate-400">puntos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Suma global de atractivos, eventos y gastronomía
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Coroplético estilo Power BI superior a la tabla */}
      {!isLoading && !isError && (
        <JaliscoChoroplethMap
          densityData={densityData}
          selectedMunicipio={searchTerm}
          onSelectMunicipio={(muni) => setSearchTerm(muni)}
        />
      )}

      {/* Main Table and Heatmap View */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Agrupación por Municipios
              </CardTitle>
              <CardDescription>
                Índice de densidad relativa calculado con respecto al municipio con mayor número de recursos turísticos.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar Municipio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white w-full sm:w-60"
                />
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="total_desc">Mayor densidad</option>
                  <option value="total_asc">Menor densidad</option>
                  <option value="name">Alfabético</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
              <p className="text-sm text-slate-500">Calculando índices geo-territoriales...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500 text-sm">
              No se pudo cargar la densidad espacial territorial en este momento.
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No se encontraron clústeres que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-4 px-6">Municipio / Corredor</th>
                    <th className="py-4 px-6">Índice de Densidad</th>
                    <th className="py-4 px-6 text-center">Desglose de Oferta</th>
                    <th className="py-4 px-6 text-right">Total</th>
                    <th className="py-4 px-6 text-right">Acción Geoespacial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {filteredData.map((item, idx) => {
                    const maxCount = stats.topCluster?.total_recursos || 1;
                    const relativePercent = Math.min(
                      100,
                      Math.round(((item.total_recursos || 0) / maxCount) * 100)
                    );
                    const desglose = item.desglose || {};
                    const lugaresCount = desglose.lugares || 0;
                    const restaurantesCount = desglose.restaurantes || 0;
                    const eventosCount = desglose.eventos || 0;

                    return (
                      <tr
                        key={item.municipio || idx}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Municipio Name */}
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-xs flex-shrink-0 border border-indigo-100 dark:border-indigo-900">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="text-base font-extrabold">{item.municipio}</div>
                              <div className="text-xs text-slate-400 font-normal">
                                {item.coordenadas_centro && item.coordenadas_centro.lat
                                  ? `${item.coordenadas_centro.lat.toFixed(4)}, ${item.coordenadas_centro.lng.toFixed(4)}`
                                  : 'Coordenadas en clúster'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Progress bar heatmap */}
                        <td className="py-4 px-6 w-64 md:w-80">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-slate-600 dark:text-slate-300">Concentración</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-black">
                                {relativePercent}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${relativePercent > 75
                                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                                  : relativePercent > 40
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                    : 'bg-indigo-400'
                                  }`}
                                style={{ width: `${Math.max(6, relativePercent)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Desglose Badges */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-2">
                            <span
                              title="Lugares"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-800/50"
                            >
                              <Building2 className="w-3.5 h-3.5" /> {lugaresCount}
                            </span>
                            <span
                              title="Restaurantes"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-100 dark:border-emerald-800/50"
                            >
                              <Utensils className="w-3.5 h-3.5" /> {restaurantesCount}
                            </span>
                            <span
                              title="Eventos"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-100 dark:border-purple-800/50"
                            >
                              <Calendar className="w-3.5 h-3.5" /> {eventosCount}
                            </span>
                          </div>
                        </td>

                        {/* Total Count */}
                        <td className="py-4 px-6 text-right font-black text-lg text-slate-900 dark:text-white">
                          {item.total_recursos || 0}
                        </td>

                        {/* Action Inspect */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleInspectMap(item)}
                            disabled={!item.coordenadas_centro?.lat}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-primary-50 hover:text-primary-600 dark:bg-slate-800 dark:hover:bg-primary-950/60 dark:hover:text-primary-400 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none"
                            title="Centrar en mapa general"
                          >
                            <span>Inspeccionar Mapa</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
