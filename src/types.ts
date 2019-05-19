export type StateUpdater = (newValue: any) => void;

export type SpaceMap = Map<Symbol, Space>;

export interface Space {
  states: any[];
  listeners: {
    [componentId: string]: StateUpdater[];
  };
}

export interface SharedAPI {
  readonly useState: <S>(defaultValue: S) => readonly [S, (newValue: S) => void];
}
