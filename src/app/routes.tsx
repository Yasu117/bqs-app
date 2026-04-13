import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { OrderInput } from './pages/OrderInput';
import { QueueDisplay } from './pages/QueueDisplay';
import { DailySummary } from './pages/DailySummary';
import { VenuesList } from './pages/VenuesList';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/venues" replace /> },
      { path: 'venues', element: <VenuesList /> },
      {
        path: 'v/:venueId',
        children: [
          { index: true, element: <Navigate to="order" replace /> },
          { path: 'order', Component: OrderInput },
          { path: 'queue', Component: QueueDisplay },
          { path: 'history', Component: DailySummary },
          { path: 'analytics', Component: DailySummary },
          { path: 'settings', Component: SettingsPage },
        ],
      },
    ],
  },
]);
