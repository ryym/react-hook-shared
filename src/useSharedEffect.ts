import { useEffect, EffectCallback } from 'react';
import { EffectSpace } from './types';

type EffectDeps = any[] | undefined;

const shouldFire = (deps: EffectDeps, nextDeps: EffectDeps) => {
  if (deps == null) {
    return true;
  }
  if (deps.length === 0) {
    return false;
  }
  return deps.some((d, i) => d !== nextDeps![i]);
};

export const makeUseSharedEffect = (space: EffectSpace, incrIdx: () => number) => {
  return function useSharedEffect(effect: EffectCallback, deps?: any[]): void {
    const idx = incrIdx();
    useEffect(() => {
      space.listenerCount += 1;
      if (space.effects.length <= idx) {
        space.effects[idx] = {
          deps: undefined,
          unsubscribe: undefined,
        };
      }

      return () => {
        space.listenerCount -= 1;
        if (space.listenerCount === 0) {
          space.effects.forEach(ef => ef.unsubscribe && ef.unsubscribe());
          space.effects = [];
        }
      };
    }, []);

    useEffect(() => {
      const ef = space.effects[idx];
      // FIXME: Reinvention of the wheel...
      if (shouldFire(ef.deps, deps)) {
        ef.unsubscribe && ef.unsubscribe();
        ef.unsubscribe = effect();
      }
      ef.deps = deps;
    });
  };
};
