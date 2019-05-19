import { useRef, useEffect } from 'react';
import { SpaceMap, SharedAPI } from './types';
import { makeUseSharedState } from './useSharedState';

export const makeUseShared = (sharedSpace: SpaceMap) => {
  const useShared = (spaceId: Symbol, componentName?: string): SharedAPI => {
    let space = sharedSpace.get(spaceId);
    if (!space) {
      space = { states: [], listeners: {} };
      sharedSpace.set(spaceId, space);
    }

    // Currently TypeScript does not allow Symbols for index type.
    // https://github.com/microsoft/TypeScript/issues/1863
    const componentId = <any>useRef(Symbol(componentName)).current;

    space.listeners[componentId] = [];
    useEffect(() => {
      return () => {
        delete space!.listeners[componentId];
      };
    }, []);

    const useSharedState = makeUseSharedState(space, componentId);

    let stateIdx = 0;
    const useState = <S>(defaultValue: S) => {
      const state = useSharedState(stateIdx, defaultValue);
      stateIdx += 1;
      return state;
    };

    return { useState };
  };

  return useShared;
};
