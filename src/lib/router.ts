import { useEffect, useState, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'book'; assistantId: string }
  | { name: 'confirmation'; bookingCode: string }
  | { name: 'admin' }
  | { name: 'assistantLogin' }
  | { name: 'assistantDashboard' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  if (hash === '/' || hash === '') return { name: 'home' };
  if (hash === '/admin') return { name: 'admin' };
  if (hash === '/assistant/login') return { name: 'assistantLogin' };
  if (hash === '/assistant/dashboard') return { name: 'assistantDashboard' };
  const bookMatch = hash.match(/^\/book\/(.+)$/);
  if (bookMatch) return { name: 'book', assistantId: decodeURIComponent(bookMatch[1]) };
  const confirmMatch = hash.match(/^\/confirmation\/(.+)$/);
  if (confirmMatch) return { name: 'confirmation', bookingCode: decodeURIComponent(confirmMatch[1]) };
  return { name: 'home' };
}

export function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}

export function useScrollSpy() {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return scrolled;
}
