import React, { useState } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { SharedProvider } from '../..';
import { CounterExample } from './counter';
import { AuthExample } from './auth';
import { MessagesExample } from './messages';

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Top</Link>
          </li>
          <li>
            <Link to="/counter">Counter Example</Link>
          </li>
          <li>
            <Link to="/auth">Auth Example</Link>
          </li>
          <li>
            <Link to="/messages">Messages Example</Link>
          </li>
        </ul>
      </nav>
      <div>
        <Route path="/counter" exact component={CounterExample} />
        <Route path="/auth" exact component={AuthExample} />
        <Route path="/messages" exact component={MessagesExample} />
      </div>
    </Router>
  );
};

render(
  <SharedProvider>
    <App />
  </SharedProvider>,
  document.getElementById('root')
);
