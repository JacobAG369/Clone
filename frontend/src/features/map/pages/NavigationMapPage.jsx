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
    <div className="w-full h-full min-h-[500px] overflow-hidden relative flex flex-1">
      <MainMap />
    </div>
  );
}
