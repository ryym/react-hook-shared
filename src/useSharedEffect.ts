import { useEffect, EffectCallback } from 'react';
import { Space } from './types';

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

export const makeUseSharedEffect = ({ effects }: Space) => {
  const useSharedEffect = (idx: number, effect: EffectCallback, deps?: any[]): void => {
    useEffect(() => {
      if (effects[idx] == null) {
        effects[idx] = {
          deps: undefined,
          unsubscribe: undefined,
          shouldUnsubscribe: false,
          listenerCount: 1,
        };
      } else {
        effects[idx].listenerCount += 1;
      }

      return () => {
        effects[idx].listenerCount -= 1;
        if (effects[idx].listenerCount === 0) {
          const { unsubscribe } = effects[idx];
          unsubscribe && unsubscribe();
          delete effects[idx];
        }
      };
    }, []);

    useEffect(() => {
      // FIXME: Reinvention of the wheel...
      if (shouldFire(effects[idx].deps, deps)) {
        const { unsubscribe } = effects[idx];
        unsubscribe && unsubscribe();
        effects[idx].unsubscribe = effect();
      }
      effects[idx].deps = deps;
    });
  };

  return useSharedEffect;
};
