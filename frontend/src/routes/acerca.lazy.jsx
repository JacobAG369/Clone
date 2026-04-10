import { createLazyFileRoute } from '@tanstack/react-router';
import { AcercaDePage } from '../features/info/pages/AcercaDePage';

export const Route = createLazyFileRoute('/acerca')({
  component: AcercaDePage,
});
