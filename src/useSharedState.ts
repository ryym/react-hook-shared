import { useState, useEffect } from 'react';
import { StateSpace } from './types';

export const makeUseSharedState = (
  space: StateSpace,
  incrIdx: () => number,
  componentId: any /* Symbol */
) => {
  space.listeners[componentId] = [];
  useEffect(() => {
    return () => {
      delete space.listeners[componentId];
      if (Object.keys(space.listeners).length === 0) {
        space.states = [];
      }
    };
  }, []);

  return function useSharedState<S>(defaultValue: S) {
    const idx = incrIdx();
    if (idx < space.states.length) {
      // XXX: Isn't there a case that a initial value should be used rather then the existing one?
      defaultValue = space.states[idx];
    }

    const [value, update] = useState(defaultValue);
    space.states[idx] = value;
    space.listeners[componentId][idx] = update;

    const updateState = (newValue: S) => {
      space.states[idx] = newValue;
      Object.getOwnPropertySymbols(space.listeners).forEach(id => {
        space.listeners[id as any][idx](newValue);
      });
    };

    return [value, updateState] as const;
  };
};
