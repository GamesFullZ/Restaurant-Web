import { useEffect } from 'react';

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Mesa` : 'Mesa · Cocina mexicana contemporánea';
  }, [title]);
}
