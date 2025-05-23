'use client';
import { useRef, useEffect } from 'react';

const useUpdateEffect = (effect, deps) => {
  const renderCycleRef = useRef(false);
  const effectCycleRef = useRef(false);
  useEffect(() => {
    const isMounted = renderCycleRef.current;
    const shouldRun = isMounted && effectCycleRef.current;
    if (shouldRun) {
      return effect();
    }
    effectCycleRef.current = true;
  }, deps);
  useEffect(() => {
    renderCycleRef.current = true;
    return () => {
      renderCycleRef.current = false;
    };
  }, []);
};

export { useUpdateEffect };
