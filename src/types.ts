import { EffectCallback, Reducer, Dispatch } from 'react';

export type StateUpdater = (newValue: any) => void;

export type SpaceMap = Map<Symbol, Space>;

export interface Space {
  state: StateSpace;
  reducer: ReducerSpace;
  effect: EffectSpace;
  multiEffects: MultiEffectSpace[];
}

export interface StateSpace {
  states: any[];
  listeners: {
    [componentId: string]: StateUpdater[];
  };
}

export interface ReducerSpace {
  states: ReducerState<any, any>[];
  listeners: {
    [componentId: string]: ReducerMapping<any, any>[];
  };
}

export interface ReducerState<S, A> {
  dispatch: Dispatch<A>;
  state: S;
}

export interface ReducerMapping<S, MS> {
  mapState: (state: S) => MS;
  mappedState: MS;
  setMappedState: (next: MS) => void;
}

export interface EffectSpace {
  listenerCount: number;
  effects: EffectState[];
}

export interface EffectState {
  deps: any[] | undefined;
  unsubscribe: void | (() => void);
}

export interface MultiEffectSpace {
  [key: string]: {
    unsubscribe: void | (() => void);
    listenerCount: number;
  };
}

export interface SharedAPI {
  readonly useState: <S>(defaultValue: S) => readonly [S, (newValue: S) => void];
  readonly useEffect: (effect: EffectCallback, deps?: any[]) => void;
  readonly useEffectPer: (key: string, effect: EffectCallback) => void;
  readonly useReducer: UseReducer;
}

export type UseReducer = <S, A, MS>(
  reducer: Reducer<S, A>,
  conf: ReducerConfig<S, MS>
) => [S, MS, Dispatch<A>];

export type ReducerConfig<S, MS> = {
  readonly initState: () => S;
  readonly mapState: (state: S) => MS;
};
