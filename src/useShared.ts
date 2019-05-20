import { useRef, useEffect, EffectCallback } from 'react';
import { SpaceMap, SharedAPI, Space, UseReducer } from './types';
import { makeUseSharedState } from './useSharedState';
import { makeUseSharedEffect } from './useSharedEffect';
import { makeUseSharedReducer } from './useSharedReducer';

export const makeUseShared = (sharedSpace: SpaceMap) => {
  const useShared = (spaceId: Symbol, componentName?: string): SharedAPI => {
    let space = sharedSpace.get(spaceId);
    if (!space) {
      space = { states: [], listeners: {}, effects: [], reducers: [] };
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
  const useSharedState = makeUseSharedState(space, componentId);
  let stateIdx = 0;
  const useState = <S>(defaultValue: S) => {
    const state = useSharedState(stateIdx, defaultValue);
    stateIdx += 1;
    return state;
  };

  const useSharedEffect = makeUseSharedEffect(space);
  let effectIdx = 0;
  const useEffect = (effect: EffectCallback, deps?: any[]): void => {
    useSharedEffect(effectIdx, effect, deps);
    effectIdx += 1;
  };

  const useSharedReducer = makeUseSharedReducer(space, componentId);
  let reducerIdx = 0;
  const useReducer: UseReducer = (reducer, conf) => {
    const result = useSharedReducer(reducerIdx, reducer, conf);
    reducerIdx += 1;
    return result;
  };

  return { useState, useEffect, useReducer };
};
