import React, { useState } from 'react';
import { useShared } from '../..';

const spaceId = Symbol();

const useCount = () => {
  const shared = useShared(spaceId);
  const [count, setCount] = shared.useState(0);
  return {
    count,
    increment: () => setCount(count + 1),
  };
};

const Counter = () => {
  const { count, increment } = useCount();
  return (
    <div>
      <div>count: {count}</div>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

const CountDisplay = () => {
  const { count } = useCount();
  return <div>Current count is {count}</div>;
};

const Toggle = ({ children }) => {
  const [shown, toggle] = useState(false);
  return (
    <div>
      <button onClick={() => toggle(!shown)}>Toggle</button>
      {shown && children}
    </div>
  );
};

export const CounterExample = () => {
  return (
    <div>
      <header>
        <h1>Counter example</h1>
        <CountDisplay />
      </header>
      <main>
        <h2>This is counter</h2>
        <Counter />
        <h2>This is another hidden counter</h2>
        <Toggle>
          <Counter />
        </Toggle>
      </main>
    </div>
  );
};
