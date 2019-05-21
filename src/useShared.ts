import { useRef, useEffect } from 'react';
import { SpaceMap, SharedAPI, Space } from './types';
import { makeUseSharedState } from './useSharedState';
import { makeUseSharedEffect } from './useSharedEffect';
import { makeUseSharedEffectPer } from './useSharedEffectPer';
import { makeUseSharedReducer } from './useSharedReducer';

export const makeUseShared = (sharedSpace: SpaceMap) => {
  const useShared = (spaceId: Symbol, componentName?: string): SharedAPI => {
    let space = sharedSpace.get(spaceId);
    if (!space) {
      space = {
        states: [],
        listeners: {},
        effects: [],
        multiEffects: [],
        reducers: [],
      };
      sharedSpace.set(spaceId, space);
    }

    // Currently TypeScript does not allow Symbols for index type.
    // https://github.com/microsoft/TypeScript/issues/1863
    const componentId = <any>useRef(Symbol(componentName)).current;

    space.listeners[componentId] = [];
    useEffect(() => {
      return () => {
        delete space!.listeners[componentId];
        if (Object.keys(space!.listeners).length === 0) {
          space!.states = [];
          // TODO: Should delete space itself from sharedSpace?
        }
      };
    }, []);

    return makeSharedHooks(space, componentId);
  };

  return useShared;
};

const makeSharedHooks = (space: Space, componentId: Symbol): SharedAPI => {
  const useSharedState = makeUseSharedState(space)(makeIndexer(), componentId);

  const useSharedEffect = makeUseSharedEffect(space)(makeIndexer());

  const useSharedEffectPer = makeUseSharedEffectPer(space)(makeIndexer());

  const useSharedReducer = makeUseSharedReducer(space)(makeIndexer(), componentId);

  return {
    useState: useSharedState,
    useEffect: useSharedEffect,
    useEffectPer: useSharedEffectPer,
    useReducer: useSharedReducer,
  };
};

const makeIndexer = () => {
  let idx = 0;
  return () => idx++;
};
