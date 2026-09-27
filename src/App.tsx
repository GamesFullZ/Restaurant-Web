import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from './components/Layouts';
import { PageSkeleton } from './components/PageSkeleton';
import { hideSplash } from './lib/splash';

const Home = lazy(() => import('./pages/home/Home'));
const MenuPage = lazy(() => import('./pages/menu/MenuPage'));
const DishPage = lazy(() => import('./pages/menu/DishPage'));
const ReservePage = lazy(() => import('./pages/reserve/ReservePage'));
const ConfirmationPage = lazy(() => import('./pages/reserve/ConfirmationPage'));
const MyAccess = lazy(() => import('./pages/my/MyAccess'));
const MyReservation = lazy(() => import('./pages/my/MyReservation'));
const MyModify = lazy(() => import('./pages/my/MyModify'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const AdminReservations = lazy(() => import('./admin/Reservations'));
const AdminModify = lazy(() => import('./admin/ReservationEdit'));
const AdminMenu = lazy(() => import('./admin/MenuAdmin'));
const DishEditor = lazy(() => import('./admin/DishEditor'));
const Trash = lazy(() => import('./admin/Trash'));
const Tables = lazy(() => import('./admin/Tables'));

/** Se monta junto con la página ya cargada: es la señal para retirar la pantalla de entrada. */
function SplashGate() {
  useEffect(() => hideSplash(), []);
  return null;
}

const s = (el: ReactNode) => (
  <Suspense fallback={<PageSkeleton />}>
    {el}
    <SplashGate />
  </Suspense>
);

const routes = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: s(<Home />) },
      { path: '/menu', element: s(<MenuPage />) },
      { path: '/menu/:slug', element: s(<DishPage />) },
      { path: '/reservar', element: s(<ReservePage />) },
      { path: '/reservar/confirmacion', element: s(<ConfirmationPage />) },
      { path: '/mis-reservas', element: s(<MyAccess />) },
      { path: '/mis-reservas/:code', element: s(<MyReservation />) },
      { path: '/mis-reservas/:code/modificar', element: s(<MyModify />) },
      { path: '*', element: s(<NotFound />) },
    ],
  },
  { path: '/admin/login', element: s(<AdminLogin />) },
  {
    path: '/admin',
    element: s(<AdminLayout />),
    children: [
      { index: true, element: s(<Dashboard />) },
      { path: 'reservas', element: s(<AdminReservations />) },
      { path: 'reservas/:code/modificar', element: s(<AdminModify />) },
      { path: 'menu', element: s(<AdminMenu />) },
      { path: 'menu/nuevo', element: s(<DishEditor />) },
      { path: 'menu/papelera', element: s(<Trash />) },
      { path: 'menu/:id', element: s(<DishEditor />) },
      { path: 'mesas', element: s(<Tables />) },
    ],
  },
];

const router = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });

export function App() {
  return <RouterProvider router={router} />;
}
