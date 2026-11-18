import { useEffect } from 'react';
import type { RefObject } from 'react';

// No CSS hides content until it has actually been registered here. Start
// just before an element enters the viewport so fast scrolling never feels blocked.
export function useScrollMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = root.current;
    if (!page || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | undefined;
    function enable() {
      if (preference.matches || !page) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
          entry.target.dataset.arrival = 'in';
          observer?.unobserve(entry.target);
        }
      }, { rootMargin: '0px 0px 40px 0px', threshold: 0 });
      page.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
        if (el.getBoundingClientRect().top > window.innerHeight + 40) {
          el.dataset.arrival = 'waiting';
          observer?.observe(el);
        }
      });
    }
    function reset() {
      observer?.disconnect();
      page?.querySelectorAll<HTMLElement>('[data-arrival]').forEach(el => el.removeAttribute('data-arrival'));
    }
    function change() { reset(); enable(); }
    enable();
    preference.addEventListener('change', change);
    return () => { preference.removeEventListener('change', change); reset(); };
  }, [root]);
}
