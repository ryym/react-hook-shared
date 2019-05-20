import { Space, ReducerConfig } from './types';
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

export const makeUseSharedReducer = (space: Space, componentIdSymbol: Symbol) => {
  // XXX
  const componentId = componentIdSymbol as any;

  const useSharedReducer = <S, A, MS>(
    idx: number,
    reducer: Reducer<S, A>,
    { initState, mapState }: ReducerConfig<S, MS>
  ): [S, MS, Dispatch<A>] => {
    const initialState = space.reducers[idx] == null ? initState() : space.reducers[idx].state;

    const initialMappedState = useRef<MS | typeof UNINITIALIZED>(UNINITIALIZED);
    if (initialMappedState.current === UNINITIALIZED) {
      initialMappedState.current = mapState(initialState);
    }

    const [mappedState, setMappedState] = useState(initialMappedState.current as MS);

    if (space.reducers[idx] == null) {
      const dispatch = (action: A) => {
        const nextState = reducer(space.reducers[idx].state, action);
        space.reducers[idx].state = nextState;
        Object.getOwnPropertySymbols(space.reducers[idx].listeners).forEach(componentId => {
          const l = space.reducers[idx].listeners[componentId as any];
          const nextMappedState = l.mapState(nextState);
          if (!shallowEqual(l.mappedState, nextMappedState)) {
            l.mappedState = nextMappedState;
            l.setMappedState(nextMappedState);
          }
        });
      };
      space.reducers[idx] = {
        dispatch,
        state: initialState,
        listeners: {
          [componentId]: {
            mapState,
            setMappedState,
            mappedState: initialMappedState.current,
          },
        },
      };
    } else if (space.reducers[idx].listeners[componentId] == null) {
      space.reducers[idx].listeners[componentId] = {
        mapState,
        setMappedState,
        mappedState: initialMappedState.current,
      };
    }

    useEffect(() => {
      return () => {
        delete space.reducers[idx].listeners[componentId];
        // TODO: Clean up.
        // Probably we don't need to hold listeners for each reducer.
      };
    }, []);

    return [space.reducers[idx].state, mappedState, space.reducers[idx].dispatch];
  };

  return useSharedReducer;
};
