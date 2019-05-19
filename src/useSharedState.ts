import { useState } from 'react';
import { Space } from './types';

export const makeUseSharedState = (space: Space, componentId: Symbol) => {
  const useSharedState = <S>(idx: number, defaultValue: S) => {
    if (idx < space.states.length) {
      // XXX: Isn't there a case that a initial value should be used rather then the existing one?
      defaultValue = space.states[idx];
    }

    const [value, update] = useState(defaultValue);
    space.states[idx] = value;
    space.listeners[componentId as any][idx] = update;

    const updateState = (newValue: S) => {
      space.states[idx] = newValue;
      Object.getOwnPropertySymbols(space.listeners).forEach(id => {
        space.listeners[id as any][idx](newValue);
      });
    };

    return [value, updateState] as const;
  };
  return useSharedState;
};
