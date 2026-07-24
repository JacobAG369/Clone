import { createLazyFileRoute } from '@tanstack/react-router';
import { HomeHero as Hero } from '../features/home/HomeHero';
import { CategoryGrid as Categories } from '../features/home/CategoryGrid';
import { DestacadosSection } from '../features/home/DestacadosSection';
import { EventosSection } from '../features/home/EventosSection';
import { RestaurantesSection } from '../features/home/RestaurantesSection';
import { TopRatedBubble } from '../components/TopRatedBubble';
import { YiyiAssistantBubble } from '../components/YiyiAssistantBubble';

export const Route = createLazyFileRoute('/')({
  component: () => (
    <div className="flex flex-col gap-8">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <Categories />
      </div>
      <DestacadosSection />
      <EventosSection />
      <RestaurantesSection />
      <TopRatedBubble />
      <YiyiAssistantBubble />
    </div>
  )
});


