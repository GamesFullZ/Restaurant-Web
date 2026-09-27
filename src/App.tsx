import { useEffect, type ComponentType } from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { PublicLayout } from './components/Layouts';
import { PageSkeleton } from './components/PageSkeleton';
import { hideSplash } from './lib/splash';

/**
 * Rutas con `lazy` del router: el código de la página se descarga antes de confirmar la
 * navegación, así la transición entre páginas pasa de una página completa a otra (sin
 * parpadeo de esqueleto) y la primera carga retira la pantalla de entrada ya con contenido.
 */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => {
  const { default: Page } = await load();
  function Routed() {
    useEffect(() => hideSplash(), []);
    return <Page />;
  }
  return { Component: Routed };
};

const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    hydrateFallbackElement: <PageSkeleton />,
    children: [
      { path: '/', lazy: page(() => import('./pages/home/Home')) },
      { path: '/menu', lazy: page(() => import('./pages/menu/MenuPage')) },
      { path: '/menu/:slug', lazy: page(() => import('./pages/menu/DishPage')) },
      { path: '/reservar', lazy: page(() => import('./pages/reserve/ReservePage')) },
      { path: '/reservar/confirmacion', lazy: page(() => import('./pages/reserve/ConfirmationPage')) },
      { path: '/mis-reservas', lazy: page(() => import('./pages/my/MyAccess')) },
      { path: '/mis-reservas/:code', lazy: page(() => import('./pages/my/MyReservation')) },
      { path: '/mis-reservas/:code/modificar', lazy: page(() => import('./pages/my/MyModify')) },
      { path: '*', lazy: page(() => import('./pages/NotFound')) },
    ],
  },
  { path: '/admin/login', lazy: page(() => import('./admin/AdminLogin')) },
  {
    path: '/admin',
    lazy: page(() => import('./admin/AdminLayout')),
    children: [
      { index: true, lazy: page(() => import('./admin/Dashboard')) },
      { path: 'reservas', lazy: page(() => import('./admin/Reservations')) },
      { path: 'reservas/:code/modificar', lazy: page(() => import('./admin/ReservationEdit')) },
      { path: 'menu', lazy: page(() => import('./admin/MenuAdmin')) },
      { path: 'menu/nuevo', lazy: page(() => import('./admin/DishEditor')) },
      { path: 'menu/papelera', lazy: page(() => import('./admin/Trash')) },
      { path: 'menu/:id', lazy: page(() => import('./admin/DishEditor')) },
      { path: 'mesas', lazy: page(() => import('./admin/Tables')) },
    ],
  },
];

const router = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });

export function App() {
  return <RouterProvider router={router} />;
}
