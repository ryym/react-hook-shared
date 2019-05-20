import { EffectCallback } from 'react';

export type StateUpdater = (newValue: any) => void;

export type SpaceMap = Map<Symbol, Space>;

export interface Space {
  states: any[];
  listeners: {
    [componentId: string]: StateUpdater[];
  };
  effects: { [idx: number]: EffectState };
}

export interface EffectState {
  deps: any[] | undefined;
  unsubscribe: void | (() => void);
  shouldUnsubscribe: boolean;
  listenerCount: number;
}

export interface SharedAPI {
  readonly useState: <S>(defaultValue: S) => readonly [S, (newValue: S) => void];
  readonly useEffect: (effect: EffectCallback, deps?: any[]) => void;
}
