import { createLazyFileRoute } from '@tanstack/react-router';
import { TerminosPage } from '../features/info/pages/TerminosPage';

export const Route = createLazyFileRoute('/terminos')({
  component: TerminosPage,
});
