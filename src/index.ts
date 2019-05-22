import { useContext } from 'react';
import { makeSharedApi } from './makeSharedApi';
import { SharedContext } from './SharedProvider';

const ERR_MSG_NO_CTX =
  '[react-hook-shared] Please wrap your component by SharedProvider to use useShared';

export const useShared = (spaceId: Symbol, componentName: string) => {
  const sharedSpace = useContext(SharedContext);
  if (sharedSpace == null) {
    throw new Error(ERR_MSG_NO_CTX);
  }

  let space = sharedSpace.get(spaceId);
  if (space == null) {
    space = {
      states: [],
      listeners: {},
      effects: [],
      multiEffects: [],
      reducers: [],
    };
    sharedSpace.set(spaceId, space);
  }

  const api = makeSharedApi(space, componentName);
  return api;
};

export { SharedProvider } from './SharedProvider';
