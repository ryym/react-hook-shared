import React, { createContext } from 'react';
import { SpaceMap } from './types';

export const SharedContext = createContext<SpaceMap | null>(null);

export const SharedProvider = ({ children }: { children: any }) => {
  const sharedSpace: SpaceMap = new Map();

  // TODO: Remove this debug code.
  (window as any)._shared = sharedSpace;

  return <SharedContext.Provider value={sharedSpace}>{children}</SharedContext.Provider>;
};
