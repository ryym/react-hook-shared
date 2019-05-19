import { SharedAPI } from './types';
import { useContext } from 'react';
import { SharedContext } from './SharedProvider';

export { SharedProvider } from './SharedProvider';
export * from './types';

const ERR_MSG_NO_CTX =
  '[react-hook-shared] Please wrap your component by SharedProvider to use useShared';

export const useShared = (spaceId: Symbol, componentName?: string): SharedAPI => {
  const api = useContext(SharedContext);
  if (api == null) {
    throw new Error(ERR_MSG_NO_CTX);
  }
  return api.useShared(spaceId, componentName);
};
