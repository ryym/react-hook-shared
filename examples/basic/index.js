import React, { useState } from 'react';
import { render } from 'react-dom';
import { SharedProvider, useShared } from '../..';

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

const App = () => {
  return (
    <section>
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
    </section>
  );
};

render(
  <SharedProvider>
    <App />
  </SharedProvider>,
  document.getElementById('root')
);
