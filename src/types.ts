import { EffectCallback, Reducer, Dispatch } from 'react';

export type StateUpdater = (newValue: any) => void;

export type SpaceMap = Map<Symbol, Space>;

export interface Space {
  states: any[];
  listeners: {
    [componentId: string]: StateUpdater[];
  };
  effects: { [idx: number]: EffectState };
  reducers: ReducerState<any, any, any>[];
}

export interface EffectState {
  deps: any[] | undefined;
  unsubscribe: void | (() => void);
  shouldUnsubscribe: boolean;
  listenerCount: number;
}

export interface ReducerState<S, MS, A> {
  dispatch: Dispatch<A>;
  state: S;
  listeners: {
    [componentId: string]: {
      mapState: (state: S) => MS;
      mappedState: MS;
      setMappedState: (next: MS) => void;
    };
  };
}

export interface SharedAPI {
  readonly useState: <S>(defaultValue: S) => readonly [S, (newValue: S) => void];
  readonly useEffect: (effect: EffectCallback, deps?: any[]) => void;
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
