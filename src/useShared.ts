import { useContext, useEffect } from 'react';
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
      listenerCount: 0,
      state: {
        states: [],
        listeners: {},
      },
      reducer: {
        states: [],
        listeners: {},
      },
      effect: {
        listenerCount: 0,
        effects: [],
      },
      multiEffects: [],
    };
    sharedSpace.set(spaceId, space);
  }

  useEffect(() => {
    space!.listenerCount += 1;
    return () => {
      space!.listenerCount -= 1;
      if (space!.listenerCount === 0) {
        sharedSpace.delete(spaceId);
      }
    };
  }, []);

  const api = makeSharedApi(space, componentName);
  return api;
};
