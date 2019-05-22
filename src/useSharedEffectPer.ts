import { EffectCallback, useEffect } from 'react';
import { Space } from './types';

export const makeUseSharedEffectPer = ({ multiEffects }: Space, incrIdx: () => number) => {
  // It would be nice if it can take an additional dependencies.
  // でもまあ useSharedEffect と同様で、コンポーネントごとに deps が違い、
  // 特定のコンポーネントの deps だけ変わった場合の対応方法が見えない。
  // dummy component 案であれば、全コンポーネントが1つの useEffect を使うので
  // 一応は大丈夫？ (特定のコンポーネントだけが変わっても全コンポーネントに反映される)
  return function useSharedEffectPer(key: string, effect: EffectCallback) {
    const idx = incrIdx();
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
};
