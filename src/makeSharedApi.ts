import { useRef, useEffect } from 'react';
import { SharedAPI, Space } from './types';
import { makeUseSharedState } from './useSharedState';
import { makeUseSharedEffect } from './useSharedEffect';
import { makeUseSharedEffectPer } from './useSharedEffectPer';
import { makeUseSharedReducer } from './useSharedReducer';

export const makeSharedApi = (space: Space, componentName?: string): SharedAPI => {
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

  return {
    useState: makeUseSharedState(space, makeIndexer(), componentId),
    useReducer: makeUseSharedReducer(space, makeIndexer(), componentId),
    useEffect: makeUseSharedEffect(space, makeIndexer()),
    useEffectPer: makeUseSharedEffectPer(space, makeIndexer()),
  };
};

const makeIndexer = () => {
  let idx = 0;
  return () => idx++;
};
