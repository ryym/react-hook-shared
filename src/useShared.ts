import { useRef, useEffect } from 'react';
import { SpaceMap, SharedAPI, Space } from './types';
import { makeUseSharedState } from './useSharedState';
import { makeUseSharedEffect } from './useSharedEffect';
import { makeUseSharedEffectPer } from './useSharedEffectPer';
import { makeUseSharedReducer } from './useSharedReducer';

export const makeUseShared = (sharedSpace: SpaceMap) => {
  const useShared = (spaceId: Symbol, componentName?: string): SharedAPI => {
    let spaceValue = sharedSpace.get(spaceId);
    if (spaceValue == null) {
      const space = {
        states: [],
        listeners: {},
        effects: [],
        multiEffects: [],
        reducers: [],
      };
      spaceValue = [makeApiMaker(space), space];
      sharedSpace.set(spaceId, spaceValue);
    }
    const [apiMaker, space] = spaceValue;

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

    return apiMaker(componentId);
  };

  return useShared;
};

const makeApiMaker = (space: Space) => {
  const apis = {
    useSharedState: makeUseSharedState(space),
    useSharedReducer: makeUseSharedReducer(space),
    useSharedEffect: makeUseSharedEffect(space),
    useSharedEffectPer: makeUseSharedEffectPer(space),
  };
  return (componentId: Symbol): SharedAPI => {
    return {
      useState: apis.useSharedState(makeIndexer(), componentId),
      useReducer: apis.useSharedReducer(makeIndexer(), componentId),
      useEffect: apis.useSharedEffect(makeIndexer()),
      useEffectPer: apis.useSharedEffectPer(makeIndexer()),
    };
  };
};

const makeIndexer = () => {
  let idx = 0;
  return () => idx++;
};
