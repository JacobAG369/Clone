import { createLazyFileRoute } from '@tanstack/react-router';
import { PrivacidadPage } from '../features/info/pages/PrivacidadPage';

export const Route = createLazyFileRoute('/privacidad')({
  component: PrivacidadPage,
});
