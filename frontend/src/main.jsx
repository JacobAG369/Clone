// punto de entrada. si esto no arranca, todo lo demás da igual.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { useThemeStore } from './store/useThemeStore'

// Initialize the theme on app load
useThemeStore.getState().initializeTheme?.() || useThemeStore.setState({ theme: localStorage.getItem('theme-storage') ? JSON.parse(localStorage.getItem('theme-storage')).state.theme : 'light' })

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { ErrorBoundary } from './components/common/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Create a new router instance
const router = createRouter({ routeTree })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Manejo automático de chunks obsoletos tras nuevo despliegue en producción
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Error al precargar chunk dinámico. Recargando aplicación...', event);
  window.location.reload();
});

// ─────────────────────────────────────────────────────────────
// FASE 4: Registro del Service Worker (PWA — soporte offline)
// ─────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registrado. Scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] Error al registrar el Service Worker:', error);
      });
  });
}
