import { ReducerConfig, ReducerSpace } from './types';
import { useRef, useState, useEffect, Reducer, Dispatch } from 'react';

const UNINITIALIZED = Symbol();

// If a/b is not an object, it just checks if the two values are identical.
const shallowEqual = (a: any, b: any): boolean => {
  if (a == null) {
    return b == null;
  }

  const keysA = Object.keys(a);
  if (keysA.length > 0) {
    return keysA.length === Object.keys(b).length && keysA.every(k => a[k] === b[k]);
  }

  return Object.is(a, b);
};

export const makeUseSharedReducer = (
  space: ReducerSpace,
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

  return function useSharedReducer<S, A, MS>(
    reducer: Reducer<S, A>,
    { initState, mapState }: ReducerConfig<S, MS>
  ): [S, MS, Dispatch<A>] {
    const idx = incrIdx();
    const initialState = space.states.length <= idx ? initState() : space.states[idx].state;

    const initialMappedState = useRef<MS | typeof UNINITIALIZED>(UNINITIALIZED);
    if (initialMappedState.current === UNINITIALIZED) {
      initialMappedState.current = mapState(initialState);
    }

    const [mappedState, setMappedState] = useState(initialMappedState.current as MS);

    if (space.states.length <= idx) {
      const dispatch = makeDispatch(idx, space, reducer);
      space.states[idx] = { dispatch, state: initialState };
    }

    space.listeners[componentId][idx] = { mapState, mappedState, setMappedState };

    const { state, dispatch } = space.states[idx];
    return [state, mappedState, dispatch];
  };
};

const makeDispatch = <A>(idx: number, space: ReducerSpace, reducer: Reducer<any, A>) => {
  return function dispatch(action: A) {
    const nextState = reducer(space.states[idx].state, action);
    space.states[idx].state = nextState;
    Object.getOwnPropertySymbols(space.listeners).forEach(componentId => {
      const l = space.listeners[componentId as any][idx];
      const nextMappedState = l.mapState(nextState);
      if (!shallowEqual(l.mappedState, nextMappedState)) {
        l.mappedState = nextMappedState;
        l.setMappedState(nextMappedState);
      }
    });
  };
};
