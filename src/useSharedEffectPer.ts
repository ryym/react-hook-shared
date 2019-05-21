import { EffectCallback, useEffect } from 'react';
import { Space } from './types';

export const makeUseSharedEffectPer = ({ multiEffects }: Space) => {
  // It would be nice if it can take an additional dependencies.
  const useSharedEffectPer = (idx: number, key: string, effect: EffectCallback) => {
    if (multiEffects[idx] == null) {
      multiEffects[idx] = {};
    }
    const subscriptions = multiEffects[idx];

    useEffect(() => {
      if (subscriptions[key] == null) {
        const unsubscribe = effect();
        subscriptions[key] = { unsubscribe, listenerCount: 1 };
      } else {
        subscriptions[key].listenerCount += 1;
      }
      return () => {
        subscriptions[key].listenerCount -= 1;
        if (subscriptions[key].listenerCount === 0) {
          const { unsubscribe } = subscriptions[key];
          unsubscribe && unsubscribe();
          delete subscriptions[key];
        }
      };
    }, [key]);
  };
  return useSharedEffectPer;
};
