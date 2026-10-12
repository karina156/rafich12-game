import { useEffect, useState } from 'react';

export function useViewport() {
  const get = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVp] = useState(get);
  useEffect(() => {
    const on = () => setVp(get());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, []);
  return { ...vp, portrait: vp.h > vp.w };
}
