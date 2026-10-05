import { useEffect } from 'react';
import { useThemeStore } from '../../../store/useThemeStore';
import MainMap from '../components/MainMap';

export default function NavigationMapPage() {
  const resetMapTheme = useThemeStore((state) => state.resetMapTheme);

  // Reset map theme when leaving the page
  useEffect(() => {
    return () => {
      resetMapTheme();
    };
  }, [resetMapTheme]);

  return (
    <div className="flex flex-1 w-full h-[calc(100dvh-64px)] sm:h-[calc(100dvh-72px)] overflow-hidden relative">
      <MainMap />
    </div>
  );
}
