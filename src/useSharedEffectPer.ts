import { EffectCallback, useEffect } from 'react';
import { MultiEffectSpace } from './types';

export const makeUseSharedEffectPer = (spaces: MultiEffectSpace[], incrIdx: () => number) => {
  // It would be nice if it can take an additional dependencies.
  return function useSharedEffectPer(key: string, effect: EffectCallback) {
    const idx = incrIdx();
    if (spaces.length <= idx) {
      spaces.push({});
    }
    const subscriptions = spaces[idx];

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
};
