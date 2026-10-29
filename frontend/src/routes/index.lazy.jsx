import { createLazyFileRoute } from '@tanstack/react-router';
import { HomeHero as Hero } from '../features/home/HomeHero';
import { CategoryGrid as Categories } from '../features/home/CategoryGrid';
import { DestacadosSection } from '../features/home/DestacadosSection';
import { EventosSection } from '../features/home/EventosSection';
import { RestaurantesSection } from '../features/home/RestaurantesSection';
import { useGeneracionesStore } from '../store/useGeneracionesStore';
import JuniorHomePage from '../features/junior/JuniorHomePage';

function HomeRouteComponent() {
  const isJuniorMode = useGeneracionesStore((state) => state.isJuniorMode);

  if (isJuniorMode) {
    return <JuniorHomePage />;
  }

  return (
    <div className="flex flex-col gap-8">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <Categories />
      </div>
      <DestacadosSection />
      <EventosSection />
      <RestaurantesSection />
    </div>
  );
}

export const Route = createLazyFileRoute('/')({
  component: HomeRouteComponent,
});
