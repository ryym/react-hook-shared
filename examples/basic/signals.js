import React, { useState } from 'react';
import { useShared } from '../../';

class Signal {
  constructor(interval) {
    this.interval = interval;
    this.subscribers = [];
    this.started = false;
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;
    setInterval(() => {
      this.subscribers.forEach(f => f());
    }, this.interval);
  }

  subscribe(func) {
    this.subscribers.push(func);
  }

  unsubscribe(func) {
    this.subscribers = this.subscribers.filter(f => f !== func);
  }
}

const SIGNALS = {
  a: new Signal(1000),
  b: new Signal(600),
  c: new Signal(200),
};

const api = {
  subscribeSignal: (signalId, onSignal) => {
    const signal = SIGNALS[signalId];
    signal.start();
    signal.subscribe(onSignal);
    return () => signal.unsubscribe(onSignal);
  },
};

const spaceId = Symbol();

const reducer = (state, signalId) => {
  return { ...state, [signalId]: (state[signalId] || 0) + 1 };
};

const useSignalCount = signalId => {
  const shared = useShared(spaceId);

  const [state, count, increment] = shared.useReducer(reducer, {
    initState: () => ({}),
    mapState: s => s[signalId],
  });

  shared.useEffectPer(signalId, () => {
    console.log('subscribe signal', signalId);
    const unsubscribe = api.subscribeSignal(signalId, () => {
      increment(signalId);
    });
    return () => {
      console.log('unsubscribe signal', signalId);
      unsubscribe();
    };
  });

  return count || 0;
};

const SignalCount = ({ signalId }) => {
  const count = useSignalCount(signalId);
  return (
    <div>
      <div>Signal {signalId}</div>
      <p>{count}</p>
    </div>
  );
};

const SignalDisplay = ({ signals }) => {
  const [selectedSignal, selectSignal] = useState(signals[0]);

  return (
    <div>
      <div>
        {signals.map(signal => (
          <label key={signal}>
            <input
              type="checkbox"
              name="signal"
              checked={signal === selectedSignal}
              onChange={() => selectSignal(signal)}
            />
            {signal}
          </label>
        ))}
      </div>
      <SignalCount signalId={selectedSignal} />
    </div>
  );
};

export const SignalsExample = () => {
  const signals = ['a', 'b', 'c'];
  return (
    <div>
      <SignalDisplay signals={signals} />
      <SignalDisplay signals={signals} />
    </div>
  );
};
