import { useEffect, EffectCallback } from 'react';
import { Space } from './types';

export const makeUseSharedEffect = ({ effects }: Space, componentId: Symbol) => {
  const useSharedEffect = (idx: number, effect: EffectCallback, deps?: any[]): void => {
    useEffect(() => {
      if (effects[idx] == null) {
        effects[idx] = {
          listeners: [componentId],
          master: componentId,
          unsubscribe: undefined,
        };
      } else {
        effects[idx].listeners.push(componentId);
      }

      return () => {
        if (effects[idx].listeners.length === 0) {
          throw new Error('[react-hook-shared] No effect listeners. Something is wrong.');
        }
        effects[idx].listeners = effects[idx].listeners.filter(c => c !== componentId);
        effects[idx].master = effects[idx].listeners[0];
      };
    }, []);

    useEffect(() => {
      if (effects[idx].master === componentId) {
        effects[idx].unsubscribe = effect();
      }
      return () => {
        const effectState = effects[idx];
        if (effectState.master === componentId) {
          effectState.unsubscribe && effectState.unsubscribe();
        }
        // All listeners are unmounted.
        if (effectState.master == null) {
          effectState.unsubscribe && effectState.unsubscribe();
          delete effects[idx];
        }
      };
    }, deps);
  };

  return useSharedEffect;
};
