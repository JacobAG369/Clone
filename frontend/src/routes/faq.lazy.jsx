import { createLazyFileRoute } from '@tanstack/react-router';
import { FaqPage } from '../features/info/pages/FaqPage';

export const Route = createLazyFileRoute('/faq')({
  component: FaqPage,
});
