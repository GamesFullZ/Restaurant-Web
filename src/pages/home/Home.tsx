import { Hero } from './Hero';
import { Marquee } from './Marquee';
import { Concept } from './Concept';
import { Featured } from './Featured';
import { Reviews } from './Reviews';
import { Location } from './Location';
import { ReserveCTA } from './ReserveCTA';
import { useTitle } from '@/lib/useTitle';
import './home.css';

export default function Home() {
  useTitle('');
  return (
    <>
      <Hero />
      <Marquee items={['Maíz nixtamalizado', 'Fuego lento', 'Mesa compartida', 'Barrio Antiguo', 'Hecho al momento']} />
      <Concept />
      <Featured />
      <Reviews />
      <Location />
      <ReserveCTA />
    </>
  );
}
