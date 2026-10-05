/**
 * useLocalFavorites — hook de favoritos basado exclusivamente en localStorage.
 *
 * Diseño:
 *  - No requiere autenticación. Funciona offline.
 *  - Persiste un array de objetos "snapshot" del recurso en localStorage.
 *  - Compatible con el mismo shape que usa useFavorites (referencia_id, tipo, recurso).
 *  - El estado se sincroniza entre pestañas mediante el evento 'storage'.
 *
 * NOTA DE ARQUITECTURA:
 *  Este hook es la implementación para el prototipo PWA (Fase 2).
 *  Convive con useFavorites (API+auth) sin reemplazarlo.
 *  Si el usuario está autenticado, su flujo principal sigue siendo useFavorites;
 *  este hook cubre el caso sin sesión y sirve de base para la evaluación offline.
 */
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'pwa_local_favorites';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Lee del localStorage y devuelve un array seguro. */
function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persiste el array en localStorage. */
function writeToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('[useLocalFavorites] No se pudo escribir en localStorage:', e);
  }
}

/**
 * Normaliza cualquier objeto de recurso al shape canónico del prototipo.
 * Acepta tanto markers del mapa como objetos del catálogo.
 */
function normalizeResource(resource) {
  const id = resource.id || resource._id || resource.referencia_id;
  return {
    referencia_id: id,
    tipo: resource.tipo || resource.tipo_recurso || 'lugar',
    saved_at: new Date().toISOString(),
    recurso: {
      id,
      nombre:    resource.nombre     || resource.name  || 'Sin nombre',
      imagen:    resource.imagen_url || resource.imagen || resource.imagenes?.[0] || null,
      rating:    resource.rating     || resource.rating_promedio || null,
      municipio: resource.municipio  || resource.ciudad || 'Jalisco',
      categoria: resource.categoria  || resource.tipo   || 'Lugar',
      descripcion: resource.descripcion || resource.description || '',
      ubicacion: resource.direccion  || resource.ubicacion || null,
    },
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLocalFavorites() {
  const [favorites, setFavorites] = useState(readFromStorage);

  // Sincroniza con cambios en otras pestañas del mismo origen
  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(readFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // ---------------------------------------------------------------------------
  // Derivados
  // ---------------------------------------------------------------------------

  /** Devuelve true si el recurso ya está en favoritos locales. */
  const isLocalFavorite = useCallback(
    (resourceId) => favorites.some((f) => f.referencia_id === resourceId),
    [favorites]
  );

  // ---------------------------------------------------------------------------
  // Mutaciones
  // ---------------------------------------------------------------------------

  /** Agrega un recurso a favoritos locales. Idempotente. */
  const addLocalFavorite = useCallback((resource) => {
    const id = resource.id || resource._id || resource.referencia_id;
    if (!id) {
      console.warn('[useLocalFavorites] addLocalFavorite: recurso sin id', resource);
      return;
    }

    setFavorites((prev) => {
      if (prev.some((f) => f.referencia_id === id)) return prev; // ya existe
      const updated = [normalizeResource(resource), ...prev];
      writeToStorage(updated);
      return updated;
    });
  }, []);

  /** Elimina un recurso de favoritos locales por su id. */
  const removeLocalFavorite = useCallback((resourceId) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.referencia_id !== resourceId);
      writeToStorage(updated);
      return updated;
    });
  }, []);

  /** Alterna el estado de favorito de un recurso. */
  const toggleLocalFavorite = useCallback(
    (resource) => {
      const id = resource.id || resource._id || resource.referencia_id;
      if (!id) return;
      if (isLocalFavorite(id)) {
        removeLocalFavorite(id);
      } else {
        addLocalFavorite(resource);
      }
    },
    [isLocalFavorite, addLocalFavorite, removeLocalFavorite]
  );

  /** Borra todos los favoritos locales. */
  const clearLocalFavorites = useCallback(() => {
    writeToStorage([]);
    setFavorites([]);
  }, []);

  return {
    /** Array de favoritos locales (shape: { referencia_id, tipo, saved_at, recurso }) */
    localFavorites: favorites,
    /** Total de favoritos almacenados */
    localFavoritesCount: favorites.length,
    isLocalFavorite,
    addLocalFavorite,
    removeLocalFavorite,
    toggleLocalFavorite,
    clearLocalFavorites,
  };
}
