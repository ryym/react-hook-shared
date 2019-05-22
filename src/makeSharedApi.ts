import { useRef } from 'react';
import { SharedAPI, Space } from './types';
import { makeUseSharedState } from './useSharedState';
import { makeUseSharedEffect } from './useSharedEffect';
import { makeUseSharedEffectPer } from './useSharedEffectPer';
import { makeUseSharedReducer } from './useSharedReducer';

export const makeSharedApi = (space: Space, componentName?: string): SharedAPI => {
  // Currently TypeScript does not allow Symbols for index type.
  // https://github.com/microsoft/TypeScript/issues/1863
  const componentId = <any>useRef(Symbol(componentName)).current;

  return {
    useState: makeUseSharedState(space.state, makeIndexer(), componentId),
    useReducer: makeUseSharedReducer(space.reducer, makeIndexer(), componentId),
    useEffect: makeUseSharedEffect(space.effect, makeIndexer()),
    useEffectPer: makeUseSharedEffectPer(space, makeIndexer()),
  };
};

const makeIndexer = () => {
  let idx = 0;
  return () => idx++;
};
