import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { GravelShift, ShiftDirection } from './gravel';

type Module = typeof import('./gravel');
type Mode = 'still' | 'fade' | 'gravel';
let rendererModule: Promise<Module | null> | undefined;
const getModule = () => rendererModule ??= import('./gravel').catch(() => null);

function preferStill() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!connection?.saveData;
}

async function within<T>(work: Promise<T>, ms: number, signal: AbortSignal): Promise<T | null> {
  if (signal.aborted) return null;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let abort: () => void = () => {};
  const budget = new Promise<null>(resolve => {
    abort = () => resolve(null);
    timeout = setTimeout(abort, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
  try {
    return await Promise.race([work, budget]);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
}

export function useSceneShift(count: number) {
  const [scene, setScene] = useState<{ index: number; mode: Mode }>({ index: 0, mode: 'still' });
  const [step, setStep] = useState<ShiftDirection | null>(null);
  const [primed, setPrimed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const renderer = useRef<GravelShift | null | undefined>(undefined);

  function warm() {
    if (preferStill()) return;
    setPrimed(true);
    void getModule();
  }
  function change(direction: ShiftDirection) {
    setUnavailable(false);
    setPrimed(true);
    setStep(pending => pending ?? direction);
  }

  useEffect(() => () => {
    renderer.current?.dispose();
    renderer.current = undefined;
  }, []);

  useEffect(() => {
    if (step === null) return;
    const controller = new AbortController();
    const { signal } = controller;
    const direction = step;
    const next = (scene.index + direction + count) % count;
    const from = images.current[scene.index];
    const to = images.current[next];
    const layer = canvas.current;
    async function shift() {
      const decoded = to ? to.decode().then(() => true, () => false) : Promise.resolve(false);
      const imageReady = within(decoded, 3800, signal);
      let played = false;
      if (from && to && layer && !preferStill() && renderer.current !== null) {
        // Skip the effect rather than making a ready image wait on the shader.
        const prepared = Promise.all([getModule(), from.decode(), decoded]).then(([module, , ready]) => ready ? module : null);
        const module = await within(prepared, 320, signal);
        if (module && !signal.aborted && !preferStill()) {
          try {
            renderer.current ??= module.createGravelShift(layer);
            played = await renderer.current?.play(from, to, direction, signal) ?? false;
          } catch {
            layer.removeAttribute('data-running');
          }
        }
      }
      const ready = await imageReady;
      if (signal.aborted) return;
      if (ready) {
        setScene({ index: next, mode: played ? 'gravel' : preferStill() ? 'still' : 'fade' });
      } else {
        // Leave the current picture in place; never fade into an unloaded slide.
        setUnavailable(true);
        setPrimed(false);
      }
      setStep(null);
    }
    void shift();
    return () => controller.abort();
  }, [count, scene.index, step]);

  useLayoutEffect(() => {
    if (step !== null || !canvas.current) return;
    // Hide only after React has committed the new active picture.
    canvas.current.removeAttribute('data-running');
    canvas.current.width = canvas.current.height = 1;
  }, [step]);

  return { scene, warm, change, primed, unavailable, busy: step !== null, images, canvas };
}
