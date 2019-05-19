import React, { createContext } from 'react';
import { SpaceMap, SharedAPI } from './types';
import { makeUseShared } from './useShared';

export type SharedAPIProvider = {
  readonly useShared: (spaceId: Symbol, componentName?: string) => SharedAPI;
};

export const SharedContext = createContext<SharedAPIProvider | null>(null);

export const SharedProvider = ({ children }: { children: any }) => {
  const sharedSpace: SpaceMap = new Map();
  const useShared = makeUseShared(sharedSpace);
  return <SharedContext.Provider value={{ useShared }}>{children}</SharedContext.Provider>;
};
